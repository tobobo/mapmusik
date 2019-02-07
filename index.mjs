import mysql from 'promise-mysql';
import createMysqlAdapter from './server/lib/mysqlAdapter.mjs';
import startDevServer from './server/startDevServer.mjs';
import config from './config/server.mjs';

const startServer = process.env.NODE_ENV === 'production' ? null : startDevServer;

const run = async () => {
  const connection = await mysql.createConnection(config.mysql);
  const mysqlAdapter = createMysqlAdapter(connection);

  startServer({ mysqlAdapter });
};

run().catch(console.log);
