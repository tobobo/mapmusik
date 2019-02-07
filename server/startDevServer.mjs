import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import process from 'process';
import fp from 'lodash/fp';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import axios from 'axios';
import setupGraphql from './lib/setupGraphql.mjs';
import config from '../config/server.js';
import webpackConfig from '../webpack.config.js';
import routes from './routes.mjs';

const app = express();

const start = ({ mysqlAdapter }) => {
  app.use(bodyParser.json());
  setupGraphql(app);
  app.set('mysqlAdapter', mysqlAdapter);

  // Dev-only
  app.use('/bundle', webpackDevMiddleware(webpack(webpackConfig)));
  app.use('/public', express.static('./client/public'));
  app.get('/s3proxy', (req, res, next) => {
    const {
      query: { url },
    } = req;
    axios
      .get(url, {
        responseType: 'stream',
        headers: fp.pick(['range', 'connection', 'user-agent', 'x-playback-session-id'])(
          req.headers
        ),
      })
      .then(response => {
        res.set(response.headers);
        response.data.pipe(res);
      })
      .catch(next);
  });

  routes(app);

  app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), './client/index.html')));

  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}...`);
  });
};

export default start;
