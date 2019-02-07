const serverConfig = require('./server.js');

module.exports = {
  defaultEnv: 'development',
  development: {
    driver: 'mysql',
    ...serverConfig.mysql,
  },
};
