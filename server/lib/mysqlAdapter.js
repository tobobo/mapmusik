module.exports = connection => {
  const createUpload = upload => connection.query(`insert into uploads SET ?`, upload);
  const getUploadByUrl = async url => {
    const uploads = await connection.query(`select * from uploads where url = ?`, [url]);
    return uploads[0];
  };
  const getVideos = ({ limit = 100 } = {}) =>
    connection.query('select * from videos order by created_at desc limit ?', [limit]);
  const createVideo = video =>
    connection.query(`insert into videos SET ?`, { created_at: new Date(), ...video });
  const updateVideo = ({ id, ...video }) => {
    if (!id) throw new Error('must specify ID when updating');
    return connection.query(`update videos SET ? where id = ?`, [
      { updated_at: new Date(), ...video },
      id,
    ]);
  };

  return { createUpload, getUploadByUrl, getVideos, createVideo, updateVideo };
};
