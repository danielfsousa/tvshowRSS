import _ from 'lodash';
import path from 'path';
import dotenv from 'dotenv-safe';
import morgan from 'morgan';
import fs from 'fs';

dotenv.load({
  path: path.join(__dirname, '../.env'),
  sample: path.join(__dirname, '../.env.example'),
});

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
    makeLogFiles: () => {
      const logMorgan = path.join(__dirname, '../logs/morgan.log');
      const logCron = path.join(__dirname, '../logs/cron.log');
      if (!fs.existsSync(path.dirname(logCron))) {
        fs.mkdirSync(path.dirname(logCron));
      }
      fs.writeFileSync(logCron, '');
      fs.writeFileSync(logMorgan, '');
    },
  },
  test: {
    logger: () => morgan('dev'),
    mongo: {
      uri: 'mongodb://localhost/rss-tv-show-test',
      options: {
        debug: false,
      },
    },
  },
  development: {
    logger: () => morgan('dev'),
    mongo: {
      uri: process.env.MONGODB_URI,
      options: {
        debug: true,
      },
    },
  },
  production: {
    logger: () => morgan('combined', { stream: fs.createWriteStream('logs/morgan.log', { flags: 'a' }) }),
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/rss-tv-shows',
    },
  },
};

module.exports = _.merge(config.all, config[config.all.env]);
export default module.exports;
