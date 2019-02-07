module.exports = {
  mysql: {
    host: process.env.MAPMUSIK_MYSQL_HOST,
    port: process.env.MAPMUSIK_MYSQL_PORT,
    user: process.env.MAPMUSIK_MYSQL_USER,
    database: process.env.MAPMUSIK_MYSQL_DATABASE,
    password: process.env.MAPMUSIK_MYSQL_PASSWORD,
  },
  aws: {
    accessKeyId: process.env.MAPMUSIK_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MAPMUSIK_AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.MAPMUSIK_AWS_BUCKET_NAME,
  },
  coconut: {
    apiKey: process.env.MAPMUSIK_COCONUT_API_KEY,
  },
  port: process.env.PORT || 8000,
};
