import path from 'path';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { TRANSCODE_MESSAGE_VERSION } from '../../../shared/contracts/transcoding.messages.js';
import {
  buildPublicUrl,
  deleteFile,
  getObjectToFile,
  uploadLocalFile,
} from '../../../services/storage.service.js';
import { enqueueTranscodeResultJob } from '../../../shared/messaging/transcodeQueues.js';
import {
  encodeHlsRendition,
  extractThumbnail,
  ffprobeJson,
  getDurationSeconds,
  getVideoDimensions,
  getVideoStreamHeight,
} from '../infrastructure/ffmpegRunner.js';

/** YouTube-style ladder: height, folder label, bandwidth hint (video+audio approx), CRF */
export const RENDITION_LADDER = [
  { height: 144, folder: '144p', bandwidth: 400_000, crf: 30 },
  { height: 240, folder: '240p', bandwidth: 700_000, crf: 29 },
  { height: 360, folder: '360p', bandwidth: 1_400_000, crf: 28 },
  { height: 480, folder: '480p', bandwidth: 2_400_000, crf: 27 },
  { height: 720, folder: '720p', bandwidth: 5_000_000, crf: 25 },
  { height: 1080, folder: '1080p', bandwidth: 9_500_000, crf: 23 },
];

function toPosix(p) {
  return p.split(path.sep).join('/');
}

async function walkFiles(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkFiles(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

function contentTypeForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.m3u8') return 'application/vnd.apple.mpegurl';
  if (ext === '.ts') return 'video/mp2t';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

/**
 * @param {object} opts
 * @param {import('../../../shared/contracts/transcoding.messages.js').TranscodeRequestedPayload} opts.payload
 * @param {import('bullmq').Job} [opts.job]
 */
export async function runTranscodePipeline({ payload, job }) {
  const { videoId, rawS3Key } = payload;
  const workRoot = await mkdtemp(path.join(tmpdir(), `ld-transcode-${videoId}-`));
  const inputPath = path.join(workRoot, 'source.bin');
  const hlsLocalRoot = path.join(workRoot, 'hls');
  const thumbPath = path.join(workRoot, 'poster.jpg');

  const reportProgress = (done, total) => {
    if (job) {
      const pct = Math.min(100, Math.round((done / total) * 100));
      job.updateProgress(pct).catch(() => {});
    }
  };

  try {
    await getObjectToFile(rawS3Key, inputPath);
    reportProgress(2, 100);

    const sourceHeight = await getVideoStreamHeight(inputPath);
    if (!sourceHeight) {
      throw new Error('No video stream or height could not be read');
    }

    const durationSeconds = await getDurationSeconds(inputPath);
    const probe = await ffprobeJson(inputPath);
    const hasAudio = (probe.streams || []).some(s => s.codec_type === 'audio');

    const ladder = RENDITION_LADDER.filter(r => r.height <= sourceHeight);
    if (!ladder.length) {
      throw new Error('Source resolution too small for ladder');
    }

    await mkdir(hlsLocalRoot, { recursive: true });

    const renditionsMeta = [];
    let step = 0;
    const totalSteps = ladder.length + 3;

    for (const rung of ladder) {
      const outDir = path.join(hlsLocalRoot, rung.folder);
      await mkdir(outDir, { recursive: true });
      const outDirPosix = toPosix(outDir);
      const inPosix = toPosix(inputPath);
      await encodeHlsRendition(inPosix, outDirPosix, rung.height, rung.crf, hasAudio);

      const files = (await walkFiles(outDir)).filter(f => f.endsWith('.ts'));
      const firstSeg = files.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      )[0];
      let width = 0;
      let height = rung.height;
      if (firstSeg) {
        const dim = await getVideoDimensions(firstSeg);
        width = dim.width;
        height = dim.height;
      }

      const playlistKey = `videos/${videoId}/hls/${rung.folder}/index.m3u8`;
      renditionsMeta.push({
        label: rung.folder,
        height,
        width,
        bandwidth: rung.bandwidth,
        playlistKey,
        playlistUrl: buildPublicUrl(playlistKey),
      });

      step += 1;
      reportProgress(Math.round((step / totalSteps) * 90) + 5, 100);
    }

    const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];
    for (const r of renditionsMeta) {
      const rel = `${r.label}/index.m3u8`;
      const res = r.width && r.height ? `,RESOLUTION=${r.width}x${r.height}` : '';
      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth}${res},CODECS="avc1.4d401f,mp4a.40.2"`
      );
      lines.push(rel);
    }
    const masterLocal = path.join(hlsLocalRoot, 'master.m3u8');
    await writeFile(masterLocal, `${lines.join('\n')}\n`, 'utf8');

    await extractThumbnail(toPosix(inputPath), toPosix(thumbPath));

    const s3Prefix = `videos/${videoId}/hls/`;
    const allFiles = await walkFiles(hlsLocalRoot);
    for (const file of allFiles) {
      const rel = toPosix(path.relative(hlsLocalRoot, file));
      const key = `${s3Prefix}${rel}`;
      await uploadLocalFile(key, file, contentTypeForFile(file));
    }

    const thumbKey = `thumbnails/${videoId}.jpg`;
    await uploadLocalFile(thumbKey, thumbPath, 'image/jpeg');

    const masterKey = `videos/${videoId}/hls/master.m3u8`;
    const masterUrl = buildPublicUrl(masterKey);
    const thumbUrl = buildPublicUrl(thumbKey);

    if (process.env.DELETE_RAW_AFTER_TRANSCODE === 'true') {
      await deleteFile(rawS3Key);
    }

    reportProgress(100, 100);

    await enqueueTranscodeResultJob({
      version: TRANSCODE_MESSAGE_VERSION,
      videoId,
      success: true,
      hlsMasterKey: masterKey,
      hlsMasterUrl: masterUrl,
      renditions: renditionsMeta,
      thumbnailKey: thumbKey,
      thumbnailUrl: thumbUrl,
      durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined,
    });
  } catch (err) {
    console.error('[transcode]', videoId, err);
    await enqueueTranscodeResultJob({
      version: TRANSCODE_MESSAGE_VERSION,
      videoId,
      success: false,
      errorMessage: err.message || String(err),
    });
  } finally {
    await rm(workRoot, { recursive: true, force: true });
  }
}
