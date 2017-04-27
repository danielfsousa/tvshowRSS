import { merge } from 'lodash';
import moment from 'moment';
import path from 'path';
import winston from 'winston';

// Import .env
require('dotenv-safe').load({
  path: path.join(__dirname, '../.env'),
  sample: path.join(__dirname, '../.env.example'),
});

// Logs Directory
const logDir = path.join(__dirname, '../logs');

// Date timestamp
function timestamp() {
  return moment().locale('pt-br').format('DD/MM/YYYY HH:mm:ss [(Brasília)]');
}

// Config object to return
const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 3000,
    mongo: {
      options: {
        db: {
          safe: true,
        },
      },
    },
    rss: {
      title: 'TvShowRSS',
      description: 'TvShowRSS Feed for',
      link: 'http://tvshowrss.tk',
      ttl: 30,
      resolution: '720p',
    },
    logDir,
    logDefault: {
      transports: [
        new winston.transports.File({
          name: 'file.errors',
          level: 'error',
          filename: path.join(logDir, 'errors.log'),
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
          filename: path.join(logDir, 'all.log'),
          handleExceptions: true,
          json: false,
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          colorize: true,
          timestamp,
        }),
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          json: false,
          colorize: true,
          prettyPrint: true,
        }),
      ],
      exitOnError: false,
    },
    logCron: {
      transports: [
        new winston.transports.File({
          level: 'info',
          filename: path.join(logDir, 'cron.log'),
          handleExceptions: true,
          json: false,
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          colorize: true,
          timestamp,
        }),
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          json: false,
          colorize: true,
          prettyPrint: true,
        }),
      ],
      exitOnError: false,
    },
  },
  test: {
    logEnv: 'dev',
    mongo: {
      uri: 'mongodb://localhost/rss-tv-show-test',
      options: {
        debug: false,
      },
    },
  },
  development: {
    logEnv: 'dev',
    mongo: {
      uri: process.env.MONGODB_URI,
      options: {
        debug: true,
      },
    },
  },
  production: {
    logEnv: 'combined',
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/rss-tv-shows',
    },
  },
};

module.exports = merge(config.all, config[config.all.env]);
export default module.exports;
