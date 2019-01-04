module.exports = connection => {
  const getVideos = () =>
    connection.query('select * from videos order by created_at desc limit 100');
  const createVideo = video =>
    connection.query(`insert into videos SET ?`, { ...{ created_at: new Date() }, video });

  return { getVideos, createVideo };
};
