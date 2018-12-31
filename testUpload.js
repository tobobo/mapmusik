const s3 = require('s3');

const config = require('./config.json');

const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const uploader = s3Client.uploadFile({
  localFile: '/Users/tbutler/Downloads/michelle_obama.png',
  s3Params: {
    Bucket: config.aws.bucketName,
    Key: 'videos/michelle_obama.png',
  },
});

uploader.on('error', console.log);
uploader.on('done', () => console.log('done!'));
