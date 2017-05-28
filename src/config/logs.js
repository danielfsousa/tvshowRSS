import moment from 'moment-timezone';
import path from 'path';
import winston from 'winston';

// Logs Directory
const dir = path.join(__dirname, '../../logs');

// Date timestamp
function timestamp() {
  return moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss [(Brasília)]');
}

// exports logs config
export default {
  logs: {
    dir,
    defaults: {
      transports: [
        new winston.transports.File({
          name: 'file.errors',
          level: 'error',
          filename: path.join(dir, 'errors.log'),
          handleExceptions: true,
          json: false,
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          colorize: true,
          timestamp,
        }),
        new winston.transports.File({
          name: 'file.all',
          level: 'info',
          filename: path.join(dir, 'all.log'),
          handleExceptions: true,
          json: false,
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          colorize: true,
          timestamp,
        }),
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'test' ? 'error' : 'debug',
          handleExceptions: process.env.NODE_ENV !== 'test',
          json: false,
          colorize: true,
          prettyPrint: true,
        }),
      ],
      exitOnError: false,
    },
    cron: {
      transports: [
        new winston.transports.File({
          level: 'info',
          filename: path.join(dir, 'cron.log'),
          handleExceptions: true,
          json: false,
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          colorize: true,
          timestamp,
        }),
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'test' ? 'error' : 'debug',
          handleExceptions: process.env.NODE_ENV !== 'test',
          json: false,
          colorize: true,
          prettyPrint: true,
        }),
      ],
      exitOnError: false,
    },
  },
};
