/**
 * Standalone process: consumes transcode-encode jobs (FFmpeg + S3).
 * Run: npm run worker:transcode
 */
import { config } from 'dotenv';
config();

import { createEncodeWorker } from '../src/shared/messaging/transcodeQueues.js';
import { runTranscodePipeline } from '../src/contexts/transcoding/application/runTranscodePipeline.js';

const worker = createEncodeWorker(async job => {
  await runTranscodePipeline({ payload: job.data, job });
});

worker.on('completed', job => {
  console.log('[encode] completed', job.id);
});

worker.on('failed', (job, err) => {
  console.error('[encode] failed', job?.id, err);
});

console.log('🎬 Transcode encode worker running');
