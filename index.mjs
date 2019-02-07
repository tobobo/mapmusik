import mysql from 'promise-mysql';
import createMysqlAdapter from './server/lib/mysqlAdapter.mjs';
import startDevServer from './server/startDevServer.mjs';
import startProdServer from './server/startProdServer.mjs';
import config from './config/server.js';

const startServer = process.env.NODE_ENV === 'production' ? startProdServer : startDevServer;

const run = async () => {
  const connection = await mysql.createPool({ ...config.mysql, connectionLimit: 3 });
  const mysqlAdapter = createMysqlAdapter(connection);

  startServer({ mysqlAdapter });
};

run().catch(console.log);
