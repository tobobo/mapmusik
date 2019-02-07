import uuidv4 from 'uuid/v4';
import { transcodeVideo } from '../lib/coconutAdapter.mjs';
import jsonHandler from '../lib/jsonHandler.mjs';

export default app => {
  app.post(
    '/webhooks/wordpress/attachment',
    jsonHandler(async req => {
      const { id: uploadId, url: escapedUrl, user_id: userId } = req.body;
      const mysqlAdapter = app.get('mysqlAdapter');

      if (userId !== '0') return { status: 200 };

      const url = unescape(escapedUrl);
      const upload = {
        id: uploadId,
        url,
      };

      await mysqlAdapter.createUpload(upload);

      const videoId = uuidv4();
      const jobId = await transcodeVideo(videoId, url);
      const video = {
        id: videoId,
        encoder_job_id: jobId,
        upload_id: uploadId,
      };

      await mysqlAdapter.createVideo(video);

      return { status: 200 };
    })
  );
};
