import fs from 'fs';
import winston from 'winston';
import config from '../config';

// Create the directory if it does not exist
if (!fs.existsSync(config.logs.dir)) {
  fs.mkdirSync(config.logs.dir);
}

export const logger = new winston.Logger(config.logs.defaults);

export const stream = {
  write: (message) => {
    logger.info(`REQUEST ${message}`);
  },
};

export const cron = new winston.Logger(config.logs.cron);
