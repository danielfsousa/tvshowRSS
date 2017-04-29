import fs from 'fs';
import winston from 'winston';
import config from '../config';

// Create the directory if it does not exist
if (!fs.existsSync(config.logs.dir)) {
  fs.mkdirSync(config.logs.dir);
}

const logger = new winston.Logger(config.logs.defaults);

if (process.env.NODE_ENV === 'test') {
  logger.remove(winston.transports.Console);
}

const stream = {
  write: (message) => {
    logger.info(`REQUEST ${message}`);
  },
};

const cron = new winston.Logger(config.logs.cron);

export { logger, stream, cron };
