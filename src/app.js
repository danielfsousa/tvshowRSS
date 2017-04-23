import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import mongoose from './services/mongoose';

import config from './config';
import api from './api';
import { error404, errorHandler } from './util/error';

const app = express();

mongoose.connect(config.mongo.uri);

// middlewares
app.use(compression());
app.use(config.logger());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// api routes
app.use(api);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(error404);
app.use(errorHandler);

export default app;
