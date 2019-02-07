const uuidv4 = require('uuid/v4');
const s3 = require('s3');
const mysql = require('promise-mysql');
const fp = require('lodash/fp');
const createMysqlAdapter = require('./server/lib/mysqlAdapter');
const config = require('./config/server.mjs');
const coconutAdapter = require('./server/lib/coconutAdapter');

const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const createVideo = async (url, { mysqlAdapter }) => {
  const videoId = uuidv4();
  const uploadId = uuidv4();
  console.log('create video', url);
  await Promise.all([
    mysqlAdapter.createUpload({ id: uploadId, url }),
    coconutAdapter.transcodeVideo(videoId, url).then(jobId =>
      mysqlAdapter.createVideo({
        id: videoId,
        upload_id: uploadId,
        encoder_job_id: jobId,
        video_url: `${videoId}/video.360.mp4`,
        thumbnail_url: `${videoId}/image.640.jpg`,
      })
    ),
  ]);
};

const uploadsDir = 'uploads';

const main = async () => {
  const connection = await mysql.createConnection(config.mysql);
  const mysqlAdapter = createMysqlAdapter(connection);

  const files = await s3Client.listObjects({
    s3Params: {
      Bucket: config.aws.bucketName,
      Prefix: uploadsDir,
    },
  });
  files.on('data', data => {
    return Promise.all(
      fp.map(async file => {
        if (file.Key.match(/\/$/)) return undefined;
        const url = `https://${config.aws.bucketName}.s3.amazonaws.com/${file.Key}`;
        const previousUpload = await mysqlAdapter.getUploadByUrl(url);
        if (previousUpload) return undefined;
        return createVideo(`https://${config.aws.bucketName}.s3.amazonaws.com/${file.Key}`, {
          mysqlAdapter,
        });
      })(data.Contents)
    );
  });
};

main();
