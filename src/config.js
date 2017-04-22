import _ from 'lodash';
import path from 'path';

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 3000,
    mongo: {
      options: {
        db: {
          safe: true
        }
      }
    }
  },
  test: {
    logger: 'dev',
    mongo: {
      uri: 'mongodb://localhost/rss-tv-shows-test',
      options: {
        debug: false
      }
    }
  },
  development: {
    logger: 'dev',
    mongo: {
      uri: 'mongodb://localhost/rss-tv-shows-dev',
      options: {
        debug: true
      }
    }
  },
  production: {
    logger: 'combined',
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/rss-tv-shows'
    }
  }
}

module.exports = _.merge(config.all, config[config.all.env]);
export default module.exports;