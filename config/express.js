const express = require('express');
const morgan = require('morgan');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');

const { logs } = require('.');
const error = require('../src/middlewares/error');
const routes = require('../src/routes/v1');

/**
 *
 * Express instance
 * @public
 */
const app = express();

app.use(morgan(logs));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compress());
app.use(methodOverride());
app.use(cors());

app.use('/api/v1', routes);

app.use(error.converter);

app.use(error.notFound);

app.use(error.handler);

module.exports = app;
