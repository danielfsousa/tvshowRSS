import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import mongoose from './services/mongoose';

import config from './config';
import api from './api';
import { badRequest } from './util/error';

const app = express();

// database
mongoose.connect(config.mongo.uri);

// middlewares
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logs
config.makeLogFiles();
app.use(config.logger());

// api routes
app.use(api);

// route not found
app.use(badRequest);

module.exports = app;
