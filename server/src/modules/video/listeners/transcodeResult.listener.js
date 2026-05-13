/**
 * Video BC: consumes transcode result jobs and updates the Video aggregate.
 */
import Video from '../schemas/video.schema.js';
import { createResultWorker } from '../../../shared/messaging/transcodeQueues.js';
import { TRANSCODE_MESSAGE_VERSION } from '../../../shared/contracts/transcoding.messages.js';

let workerInstance;

/**
 * @param {import('../../../shared/contracts/transcoding.messages.js').TranscodeResultPayload} payload
 */
export async function applyTranscodeResult(payload) {
  const { videoId, success } = payload;
  const video = await Video.findById(videoId);
  if (!video) {
    console.warn('[transcodeResult] video not found', videoId);
    return;
  }

  if (video.status === 'COMPLETED' && success) {
    return;
  }

  if (!success) {
    await Video.findByIdAndUpdate(videoId, {
      $set: {
        status: 'FAILED',
        processingError: payload.errorMessage || 'Transcode failed',
      },
    });
    return;
  }

  await Video.findByIdAndUpdate(videoId, {
    $set: {
      status: 'COMPLETED',
      hlsMasterUrl: payload.hlsMasterUrl,
      hlsMasterKey: payload.hlsMasterKey,
      videoUrl: payload.hlsMasterUrl,
      videoId: payload.hlsMasterKey,
      renditions: (payload.renditions || []).map(r => ({
        label: r.label,
        height: r.height,
        width: r.width,
        bandwidth: r.bandwidth,
        playlistUrl: r.playlistUrl,
        playlistKey: r.playlistKey,
      })),
      thumbnailUrl: payload.thumbnailUrl,
      thumbnailId: payload.thumbnailKey,
      durationSeconds: payload.durationSeconds,
      processingError: null,
    },
  });
}

export function startTranscodeResultListener() {
  if (workerInstance) {
    return workerInstance;
  }

  workerInstance = createResultWorker(async job => {
    const payload = job.data;
    if (payload.version && payload.version !== TRANSCODE_MESSAGE_VERSION) {
      console.warn('[transcodeResult] unexpected message version', payload.version);
    }
    await applyTranscodeResult(payload);
  });

  workerInstance.on('failed', (job, err) => {
    console.error('[transcodeResult] job failed', job?.id, err);
  });

  console.log('✅ Transcode result listener started');
  return workerInstance;
}

export async function stopTranscodeResultListener() {
  if (workerInstance) {
    await workerInstance.close();
    workerInstance = null;
  }
}
