const mysql = require('promise-mysql');
const createMysqlAdapter = require('./server/lib/mysqlAdapter');
const config = require('./config/server.json');
const devServer = require('./server/devServer');

const server = process.env.NODE_ENV === 'production' ? null : devServer;

const run = async () => {
  const connection = await mysql.createConnection(config.mysql);
  const mysqlAdapter = createMysqlAdapter(connection);

  server.start({ mysqlAdapter });
};

run().catch(console.log);
