import s3 from 's3';
import mysql from 'promise-mysql';
import fp from 'lodash/fp';
import path from 'path';
import createMysqlAdapter from './server/lib/mysqlAdapter';
import config from './config/server.js';

const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const videosDir = 'videos';
const s3BaseUrl = `https://${config.aws.bucketName}.s3.amazonaws.com/`;

const main = async () => {
  const connection = await mysql.createConnection(config.mysql);
  const mysqlAdapter = createMysqlAdapter(connection);

  const files = await s3Client.listObjects({
    s3Params: {
      Bucket: config.aws.bucketName,
      Prefix: videosDir,
    },
  });
  files.on('data', data => {
    return Promise.all(
      fp.map(async file => {
        const fileName = file.Key;
        if (path.extname(fileName) !== '.mp4') return;
        const dirName = path.dirname(fileName);
        const videoId = path.basename(dirName);
        console.log(fileName, dirName, videoId);
        const videoData = {
          id: videoId,
          video_url: `${s3BaseUrl}${fileName}`,
          thumbnail_url: `${s3BaseUrl}${dirName}/image.640.jpg`,
        };
        await mysqlAdapter.createVideo(videoData);
      })(data.Contents)
    );
  });
};

main();
