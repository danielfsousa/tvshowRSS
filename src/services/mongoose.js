import mongoose from 'mongoose';
import { logger } from '../util/logger';
import config from '../config';

Object.keys(config.mongo.options).forEach((key) => {
  mongoose.set(key, config.mongo.options[key]);
});

mongoose.Promise = Promise;

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

export default mongoose;
