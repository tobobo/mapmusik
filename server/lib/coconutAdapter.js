const coconutApi = require('coconutjs');

const config = require('../../config/server.json');

const s3BaseUrl = `s3://${config.aws.accessKeyId}:${config.aws.secretAccessKey}@${
  config.aws.bucketName
}`;

const buildVideoFromPayload = (id, coconutPayload) => ({
  id,
  encoder_job_id: coconutPayload.id,
  video_url: coconutPayload.output_urls['mp4:360p'],
  thumbnail_url: coconutPayload.output_urls['jpg:640x'],
});

const transcodeVideo = (videoId, sourceUrl) => {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    coconutApi.createJob(
      {
        api_key: config.coconut.apiKey,
        source: sourceUrl,
        webhook: 'https://example.com/webhook',
        outputs: {
          'mp4:360p': `${s3BaseUrl}/videos/${videoId}/video.360.mp4`,
          'jpg:640x': `${s3BaseUrl}/videos/${videoId}/image.640.jpg`,
        },
      },
      job => {
        if (job.status === 'ok') {
          resolve(job);
          return;
        }
        const err = new Error('Coconut job failed');
        err.job = job;
        reject(err);
      }
    );
  });
};

module.exports = {
  buildVideoFromPayload,
  transcodeVideo,
};
