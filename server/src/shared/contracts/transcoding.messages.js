/**
 * Integration message contracts between Video and Transcoding bounded contexts.
 */
export const TRANSCODE_MESSAGE_VERSION = 1;

/** @typedef {Object} TranscodeRequestedPayload */
/** @property {number} version */
/** @property {string} videoId */
/** @property {string} rawS3Key */
/** @property {string} bucket */
/** @property {string} region */

/** @typedef {Object} RenditionMeta */
/** @property {string} label */
/** @property {number} height */
/** @property {number} bandwidth */
/** @property {string} playlistKey */
/** @property {string} playlistUrl */

/** @typedef {Object} TranscodeResultPayload */
/** @property {number} version */
/** @property {string} videoId */
/** @property {boolean} success */
/** @property {string} [errorMessage] */
/** @property {string} [hlsMasterKey] */
/** @property {string} [hlsMasterUrl] */
/** @property {RenditionMeta[]} [renditions] */
/** @property {string} [thumbnailKey] */
/** @property {string} [thumbnailUrl] */
/** @property {number} [durationSeconds] */

export function buildTranscodeRequestedPayload({ videoId, rawS3Key, bucket, region }) {
  return {
    version: TRANSCODE_MESSAGE_VERSION,
    videoId,
    rawS3Key,
    bucket,
    region,
  };
}
