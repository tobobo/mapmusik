export default connection => {
  const createUpload = upload => connection.query(`insert into uploads SET ?`, upload);
  const getUploadByUrl = async url => {
    const uploads = await connection.query(`select * from uploads where url = ?`, [url]);
    return uploads[0];
  };
  const getUploads = ({ limit = 100 } = {}) =>
    connection.query('select * from uploads limit = ?', [limit]);
  const getVideos = ({ limit = 100 } = {}) =>
    connection.query(
      'select * from videos where video_url is not null order by created_at desc limit ?',
      [limit]
    );
  const getFeaturedVideos = ({ limit = 100 } = {}) =>
    connection.query(
      'select videos.* from featured_videos join videos on featured_videos.video_id = videos.id where videos.video_url is not null order by featured_videos.order asc limit ?',
      [limit]
    );
  const getVideoByEncoderJobId = async encoderJobId => {
    const [video] = await connection.query(
      'select * from videos where encoder_job_id = ? limit 1',
      [encoderJobId]
    );
    return video;
  };
  const createVideo = video =>
    connection.query(`insert into videos SET ?`, { created_at: new Date(), ...video });
  const updateVideo = ({ id, ...video }) => {
    if (!id) throw new Error('must specify ID when updating');
    return connection.query(`update videos SET ? where id = ?`, [
      { updated_at: new Date(), ...video },
      id,
    ]);
  };

  process.on('exit', () => connection.end());

  return {
    createUpload,
    getUploadByUrl,
    getUploads,
    getVideoByEncoderJobId,
    getVideos,
    getFeaturedVideos,
    createVideo,
    updateVideo,
  };
};
