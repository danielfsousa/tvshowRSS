import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';

import config from './config';
import api from './api';
import { error404, errorHandler } from './util/error';

const app = express();

// middlewares
app.use(logger(config.logger));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// api routes
app.use(api);

app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(error404);
app.use(errorHandler);

export default app;
