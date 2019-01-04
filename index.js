const uuidv4 = require('uuid/v4');
const mysql = require('promise-mysql');
const createMysqlAdapter = require('./server/lib/mysqlAdapter');
const config = require('./config/server.json');
const coconutAdapter = require('./server/lib/coconutAdapter');

const run = async () => {
  const connection = await mysql.createConnection(config.mysql);
  const mysqlAdapter = createMysqlAdapter(connection);

  console.log(
    await mysqlAdapter.createVideo(
      coconutAdapter.buildVideoFromPayload('d521aa08-c260-4873-876f-261200d5d898', {
        id: 12393680,
        errors: {},
        output_urls: {
          'mp4:360p':
            'http://mapmusik-dev.s3.amazonaws.com/videos/d521aa08-c260-4873-876f-261200d5d898/video.360.mp4',
          'jpg:640x': [
            'http://mapmusik-dev.s3.amazonaws.com/videos/d521aa08-c260-4873-876f-261200d5d898/image.640.jpg',
          ],
        },
        event: 'job.completed',
      })
    )
  );
  console.log(await mysqlAdapter.getVideos());
  
  // const videoId = uuidv4();
  // console.log('video id', videoId);
  // await coconutAdapter.transcodeVideo(
  //   videoId,
  //   `https://${config.aws.bucketName}.s3.amazonaws.com/uploads/IMG_4220.mov`
  // )
  //   .then(console.log)
  //   .catch(console.log);

  connection.end();
};

run();
