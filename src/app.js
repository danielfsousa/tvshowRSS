import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from './services/mongoose';
import { stream } from './util/logger';
import config from './config';
import { badRequest } from './util/error';
import api from './api';

const app = express();

// database
mongoose.connect(config.mongo.uri);

// middlewares
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logs
app.use(morgan(config.logEnv, { stream }));

// api routes
app.use(api);

// route not found
app.use(badRequest);

module.exports = app;
