const mongoose = require('mongoose');

const {
  mongo: { uri, auth },
  env,
} = require('.');

if (env === 'development') {
  mongoose.set('debug', true);
}

mongoose.set('strictQuery', true);

const options = {};

if (auth.username) {
  options.auth = {
    username: auth.username,
  };

  if (auth.password) options.auth.password = auth.password;
}

/**
 *
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose.connect(uri, options);
  return mongoose.connection;
};
