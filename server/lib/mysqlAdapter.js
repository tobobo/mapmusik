module.exports = connection => {
  const getVideos = () =>
    connection.query('select * from videos order by created_at desc limit 100');
  const createVideo = video =>
    connection.query(`insert into videos SET ?`, { created_at: new Date(), ...video });
  const updateVideo = (id, video) =>
    connection.query(`update videos SET ? where id = ?`, [
      { updated_at: new Date(), ...video },
      id,
    ]);

  return { getVideos, createVideo, updateVideo };
};
