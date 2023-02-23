require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  mongo: {
    uri:
      process.env.NODE_ENV === 'test'
        ? process.env.MONGO_TEST_URI
        : process.env.MONGO_URI,
    auth: {
      username: process.env.MONGO_USER,
      password: process.env.MONGO_PASSWORD,
    },
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};
