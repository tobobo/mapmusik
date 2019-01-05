import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { cwd } from 'process';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import setupGraphql from './lib/setupGraphql.mjs';
import config from '../config/server.json';
import webpackConfig from '../webpack.config.js';

const app = express();

app.use(bodyParser.json());

const start = ({ mysqlAdapter }) => {
  setupGraphql(app);
  app.set('mysqlAdapter', mysqlAdapter);

  // Dev-only
  app.use('/bundle', webpackDevMiddleware(webpack(webpackConfig)));
  app.use('/public', express.static('./client/public'));
  app.get('*', (req, res) => res.sendFile(path.join(cwd(), './client/index.html')));

  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}...`);
  });
};

export default start;
