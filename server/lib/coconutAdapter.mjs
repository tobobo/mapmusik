import coconutApi from 'coconutjs';
import config from '../../config/server.js';

const s3BaseUrl = `s3://${config.aws.accessKeyId}:${config.aws.secretAccessKey}@${
  config.aws.bucketName
}`;

const transcodeVideo = (videoId, sourceUrl, coconutOptions) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    coconutApi.createJob(
      {
        api_key: config.coconut.apiKey,
        source: sourceUrl,
        webhook: 'https://app.coconut.co/tools/webhooks/1a95362a/tobobo',
        outputs: {
          'mp4:360p:x': `${s3BaseUrl}/videos/${videoId}/video.360.mp4`,
          'jpg:640x': `${s3BaseUrl}/videos/${videoId}/image.640.jpg`,
          mp3: `${s3BaseUrl}/videos/${videoId}/mp3.128k.mp3`,
          'mp4:360p': `${s3BaseUrl}/videos/${videoId}/preview.360.mp4`,
        },
        ...coconutOptions,
      },
      job => {
        if (job.status === 'ok') {
          resolve(job.id);
          return;
        }
        const err = new Error('Coconut job failed');
        err.job = job;
        reject(err);
      }
    );
  });

// eslint-disable-next-line import/prefer-default-export
export { transcodeVideo };
