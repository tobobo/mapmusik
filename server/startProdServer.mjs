import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import process from 'process';
import compression from 'compression';
import config from '../config/server.js';
import routes from './routes.mjs';

const app = express();

const start = ({ mysqlAdapter }) => {
  app.use(bodyParser.json());
  app.use(compression());
  app.set('mysqlAdapter', mysqlAdapter);

  app.use('/bundle', express.static('./prod-bundle'));
  app.use('/public', express.static('./client/public'));

  routes(app);

  app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), './client/index.html')));

  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}...`);
  });
};

export default start;
