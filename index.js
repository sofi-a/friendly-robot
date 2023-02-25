const { port, env } = require('./config');
const logger = require('./config/logger');
const app = require('./config/express');
const { connect } = require('./config/mongoose');

function listen() {
  app.listen(port || 5000, '0.0.0.0', () => {
    logger.info(`server listening on port ${port || 5000} (${env})`);
  });
}

const connection = connect();
let connected = false;

const waitForConnection = () =>
  new Promise((resolve) => {
    if (!connected) {
      const interval = setInterval(() => {
        if (connected) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    } else {
      resolve();
    }
  });

connection
  .on('open', () => {
    connected = true;
  })
  .on('disconnected', () => {
    connected = false;
  })
  .on('error', (err) => {
    logger.error(`${err}`);
    process.exit(-1);
  });

waitForConnection().then(listen);

/**
 *
 * Exports express
 * @public
 */
module.exports = app;
