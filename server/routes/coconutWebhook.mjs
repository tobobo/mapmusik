import jsonHandler from '../lib/jsonHandler.mjs';

export default app => {
  app.post(
    '/webhooks/coconut',
    // eslint-disable-next-line complexity
    jsonHandler(async req => {
      const { id: encoderJobId, output_urls: outputUrls, event } = req.body;
      const mysqlAdapter = app.get('mysqlAdapter');

      if (event !== 'job.completed') {
        return { status: 200 };
      }

      const {
        mp3: audioUrl,
        'jpg:640x': thumbnailUrlArray,
        'mp4:360p:x': videoUrl,
        'mp4:360p': previewUrl,
      } = outputUrls;

      const [thumbnailUrl] = thumbnailUrlArray || [];

      const { id } = await mysqlAdapter.getVideoByEncoderJobId(encoderJobId);

      const getPath = url => url.split('/videos/')[1];

      const video = {
        id,
        ...(audioUrl && { audio_url: getPath(audioUrl) }),
        ...(thumbnailUrl && { thumbnail_url: getPath(thumbnailUrl) }),
        ...(videoUrl && { video_url: getPath(videoUrl) }),
        ...(previewUrl && { preview_url: getPath(previewUrl) })
      };

      await mysqlAdapter.updateVideo(video);

      return { status: 200 };
    })
  );
};
