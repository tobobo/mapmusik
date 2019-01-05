const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const path = require('path');
const webpackDevMiddleware = require('webpack-dev-middleware');
const setupGraphql = require('./lib/setupGraphql');
const config = require('../config/server.json');
const webpackConfig = require('../webpack.config.js');

const app = express();

app.use(bodyParser.json());

const start = ({ mysqlAdapter }) => {
  setupGraphql(app);
  app.set('mysqlAdapter', mysqlAdapter);

  app.use('/bundle', webpackDevMiddleware(webpack(webpackConfig)));
  app.use('/public', express.static('./client/public'));

  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/index.html')));

  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}...`);
  });
};

module.exports = {
  start,
};
