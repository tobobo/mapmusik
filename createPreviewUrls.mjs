import mysql from 'promise-mysql';
import fp from 'lodash/fp';
import { transcodeVideo } from './server/lib/coconutAdapter.mjs';
import createMysqlAdapter from './server/lib/mysqlAdapter.mjs';
import config from './config/server.js';

const s3BaseUrl = `s3://${config.aws.accessKeyId}:${config.aws.secretAccessKey}@${
  config.aws.bucketName
}`;

const main = async () => {
  const connection = await mysql.createConnection(config.mysql);
  const { updateVideo } = createMysqlAdapter(connection);
  const uploadsWithVideoIds = await connection.query(
    'select uploads.url as uploadUrl, videos.id as videoId from uploads join videos on uploads.id = videos.upload_id'
  );
  await Promise.all(
    fp.map(async ({ uploadUrl, videoId }) => {
      const previewSuffix = `${videoId}/preview.360.mp4`;
      const webhookOptions = config.webhookHost
        ? { webhook: `${config.webhookHost}/webhooks/coconut` }
        : {};
      const jobId = await transcodeVideo(videoId, uploadUrl, {
        outputs: {
          'mp4:360p': `${s3BaseUrl}/videos/${previewSuffix}`,
        },
        ...webhookOptions,
      });
      await updateVideo({ id: videoId, encoder_job_id: jobId, preview_url: previewSuffix });
      console.log('completed', videoId);
    })(uploadsWithVideoIds)
  );
  console.log('done with all videos');
};

main().catch(console.log);
