const setupApp = (app, { mysqlAdapter }) => {
  app.set('mysqlAdapter', mysqlAdapter);
};

module.exports = setupApp;
