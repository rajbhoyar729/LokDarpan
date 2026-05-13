import { Queue, Worker } from 'bullmq';
import { createRedisConnection } from '../../config/redis.js';

export const QUEUE_TRANSCODE_ENCODE = 'transcode-encode';
export const QUEUE_TRANSCODE_RESULT = 'transcode-result';

let encodeQueue;
let resultQueue;

export function getEncodeQueue() {
  if (!encodeQueue) {
    encodeQueue = new Queue(QUEUE_TRANSCODE_ENCODE, {
      connection: createRedisConnection(),
    });
  }
  return encodeQueue;
}

export function getResultQueue() {
  if (!resultQueue) {
    resultQueue = new Queue(QUEUE_TRANSCODE_RESULT, {
      connection: createRedisConnection(),
    });
  }
  return resultQueue;
}

/**
 * @param {import('../contracts/transcoding.messages.js').TranscodeRequestedPayload} payload
 */
export async function enqueueTranscodeEncodeJob(payload) {
  const q = getEncodeQueue();
  const job = await q.add('encode', payload, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 30_000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
  });
  return job;
}

/**
 * @param {import('../contracts/transcoding.messages.js').TranscodeResultPayload} payload
 */
export async function enqueueTranscodeResultJob(payload) {
  const q = getResultQueue();
  await q.add('result', payload, {
    attempts: 5,
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 200 },
  });
}

/**
 * @param {(job: import('bullmq').Job) => Promise<void>} processor
 */
export function createEncodeWorker(processor) {
  return new Worker(QUEUE_TRANSCODE_ENCODE, processor, {
    connection: createRedisConnection(),
    concurrency: Number(process.env.TRANSCODE_ENCODE_CONCURRENCY) || 1,
  });
}

/**
 * @param {(job: import('bullmq').Job) => Promise<void>} processor
 */
export function createResultWorker(processor) {
  return new Worker(QUEUE_TRANSCODE_RESULT, processor, {
    connection: createRedisConnection(),
    concurrency: 4,
  });
}
