import jsonHandler from '../lib/jsonHandler.mjs';

export default app => {
  app.post(
    '/webhooks/coconut',
    jsonHandler(async req => {
      const { id: encoderJobId, output_urls: outputUrls, event } = req.body;
      const mysqlAdapter = app.get('mysqlAdapter');

      if (event !== 'job.completed') {
        return { status: 200 };
      }

      const {
        mp3: audioUrl,
        'jpg:640x': [thumbnailUrl],
        'mp4:360p:x': videoUrl,
      } = outputUrls;

      if (!audioUrl || !thumbnailUrl || !videoUrl)
        throw new Error(`Error getting data from coconut webhook: ${JSON.stringify(req.body)}`);

      const { id } = await mysqlAdapter.getVideoByEncoderJobId(encoderJobId);

      const getPath = url => url.split('/videos/')[1];

      const video = {
        id,
        audio_url: getPath(audioUrl),
        thumbnail_url: getPath(thumbnailUrl),
        video_url: getPath(videoUrl),
      };

      await mysqlAdapter.updateVideo(video);

      return { status: 200 };
    })
  );
};
