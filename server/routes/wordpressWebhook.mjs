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
      console.log('upload', upload);
      await mysqlAdapter.createUpload(upload);
      const videoId = uuidv4();
      const coconutArgs = [videoId, url];
      console.log('coconutArgs', coconutArgs);
      const jobId = await transcodeVideo(...coconutArgs);
      const video = {
        id: videoId,
        encoder_job_id: jobId,
        upload_id: uploadId,
      };
      console.log('video', video);
      await mysqlAdapter.createVideo(video);
      return { status: 200, body: { videoId } };
    })
  );
};
