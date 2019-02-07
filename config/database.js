const serverConfig = require('./server.mjs');

module.exports = {
  defaultEnv: 'development',
  development: {
    driver: 'mysql',
    ...serverConfig.mysql,
  },
};
