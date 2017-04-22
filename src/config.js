import _ from 'lodash';
import path from 'path';
import dotenv from 'dotenv-safe';

if (process.env.NODE_ENV !== 'production') {
  dotenv.load({
    path: path.join(__dirname, '../.env'),
    sample: path.join(__dirname, '../.env.example'),
  });
}

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 3000,
    moviedb: process.env.MOVIEDB_API_KEY,
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
    },
  },
  test: {
    logger: 'dev',
    mongo: {
      uri: 'mongodb://localhost/rss-tv-show-test',
      options: {
        debug: false,
      },
    },
  },
  development: {
    logger: 'dev',
    mongo: {
      uri: process.env.MONGODB_URI,
      options: {
        debug: true,
      },
    },
  },
  production: {
    logger: 'combined',
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/rss-tv-shows',
    },
  },
};

module.exports = _.merge(config.all, config[config.all.env]);
export default module.exports;
