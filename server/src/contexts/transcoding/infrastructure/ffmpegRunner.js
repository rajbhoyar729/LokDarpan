import { spawn } from 'child_process';

export function runBin(command, args, { captureStdout = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', captureStdout ? 'pipe' : 'ignore', 'pipe'],
      windowsHide: true,
    });
    let stderr = '';
    let stdout = '';
    if (captureStdout && child.stdout) {
      child.stdout.on('data', d => {
        stdout += d.toString();
      });
    }
    child.stderr.on('data', d => {
      stderr += d.toString();
    });
    child.on('error', err => reject(err));
    child.on('close', code => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} exited ${code}: ${stderr.slice(-6000)}`));
    });
  });
}

export async function ffprobeJson(inputPath) {
  const out = await runBin('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    inputPath,
  ], { captureStdout: true });
  return JSON.parse(out || '{}');
}

export async function getVideoStreamHeight(inputPath) {
  const j = await ffprobeJson(inputPath);
  const v = (j.streams || []).find(s => s.codec_type === 'video');
  return v?.height ? Number(v.height) : 0;
}

export async function getDurationSeconds(inputPath) {
  const j = await ffprobeJson(inputPath);
  const d = j.format?.duration;
  return d != null ? Number(d) : 0;
}

export async function getVideoDimensions(filePath) {
  const j = await ffprobeJson(filePath);
  const v = (j.streams || []).find(s => s.codec_type === 'video');
  return {
    width: v?.width ? Number(v.width) : 0,
    height: v?.height ? Number(v.height) : 0,
  };
}

/**
 * @param {string} inputPath posix-friendly
 * @param {string} outDir posix-friendly output directory
 * @param {number} height target height (scale -2:height)
 * @param {number} crf
 * @param {boolean} hasAudio
 */
export async function encodeHlsRendition(inputPath, outDir, height, crf, hasAudio) {
  const playlist = `${outDir}/index.m3u8`;
  const seg = `${outDir}/seg_%03d.ts`;
  const vf = `scale=-2:${height}:force_original_aspect_ratio=decrease:force_divisible_by=2`;
  const args = [
    '-y',
    '-i',
    inputPath,
    '-map',
    '0:v:0',
    '-vf',
    vf,
    '-c:v',
    'libx264',
    '-preset',
    process.env.FFMPEG_PRESET || 'fast',
    '-profile:v',
    'main',
    '-crf',
    String(crf),
  ];
  if (hasAudio) {
    args.push('-map', '0:a:0', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-ar', '48000');
  }
  args.push(
    '-hls_time',
    '6',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_filename',
    seg,
    '-hls_list_size',
    '0',
    playlist
  );
  await runBin('ffmpeg', args);
}

export async function extractThumbnail(inputPath, outputJpg) {
  await runBin('ffmpeg', [
    '-y',
    '-ss',
    '00:00:01',
    '-i',
    inputPath,
    '-vframes',
    '1',
    '-q:v',
    '2',
    outputJpg,
  ]);
}
