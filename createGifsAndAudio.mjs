import mysql from 'promise-mysql';
import fp from 'lodash/fp';
import createMysqlAdapter from './server/lib/mysqlAdapter.mjs';
import { transcodeVideo } from './server/lib/coconutAdapter.mjs';
import config from './config/server.js';

const s3BaseUrl = `s3://${config.aws.accessKeyId}:${config.aws.secretAccessKey}@${
  config.aws.bucketName
}`;

const main = async () => {
  const connection = await mysql.createConnection(config.mysql);
  const mysqlAdapter = createMysqlAdapter(connection);
  const uploadsWithVideoIds = await connection.query(
    'select uploads.url as uploadUrl, videos.id as videoId from uploads join videos on uploads.id = videos.upload_id'
  );
  await Promise.all([
    fp.map(async ({ uploadUrl, videoId }) => {
      await transcodeVideo(videoId, uploadUrl, {
        outputs: {
          'gif:320x': `${s3BaseUrl}/videos/${videoId}/gif.320.gif`,
          mp3: `${s3BaseUrl}/videos/${videoId}/mp3.128k.mp3`,
        },
      });
      await mysqlAdapter.updateVideo({
        id: videoId,
        gif_url: `${videoId}/gif.320.gif`,
        audio_url: `${videoId}/mp3.128k.mp3`,
      });
    })(uploadsWithVideoIds),
  ]);
};

main().catch(console.log);
