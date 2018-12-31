const coconutApi = require('coconutjs');

const config = require('../config.json');

const s3BaseUrl = `s3://${config.aws.accessKeyId}:${config.aws.secretAccessKey}@${
  config.aws.bucketName
}`;
console.log('base url', s3BaseUrl);

function transcodeVideo(videoId, sourceUrl) {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    coconutApi.createJob(
      {
        api_key: config.coconut.apiKey,
        source: sourceUrl,
        webhook: 'https://example.com/webhook',
        outputs: {
          'mp4:360p': `${s3BaseUrl}/videos/${videoId}.360.mp4`,
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
}

module.exports = { transcodeVideo };
