import fs from 'fs';
import winston from 'winston';
import config from '../config';

// Create the directory if it does not exist
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir);
}

export const logger = new winston.Logger(config.logDefault);

export const stream = {
  write: (message) => {
    logger.info(`REQUEST ${message}`);
  },
};

export const cron = new winston.Logger(config.logCron);
