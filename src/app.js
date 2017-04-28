/**
 * Module dependencies.
 * @private
 */

import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from './services/mongoose';
import { stream } from './util/logger';
import config from './config';
import { badRequest } from './util/error';
import api from './api';

/**
 * Express instance
 * @public
 */
const app = express();

// connect to database
mongoose.connect(config.mongo.uri);

// middlewares
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logs
app.use(morgan(config.logs.env, { stream }));

// routes
app.use(api);
app.use(badRequest);

// exports app instance
module.exports = app;
