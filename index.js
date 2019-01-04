const uuidv4 = require('uuid/v4');
const mysql = require('promise-mysql');
const config = require('./config/server.json');

const { transcodeVideo } = require('./lib/transcodeVideo');

transcodeVideo(uuidv4(), `https://${config.aws.bucketName}.s3.amazonaws.com/uploads/IMG_4101.MOV`)
  .then(console.log)
  .catch(console.log);
