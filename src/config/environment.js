import app from './app';

const development = {
  logs: { env: 'dev' },
  mongo: {
    uri: process.env.MONGODB_URI,
    options: {
      debug: true,
    },
  },
};

const test = {
  logs: { env: 'dev' },
  mongo: {
    uri: 'mongodb://localhost/rss-tv-show-test',
    options: {
      debug: false,
    },
  },
};

const production = {
  logs: { env: 'combined' },
  port: process.env.PORT || 8080,
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost/rss-tv-shows',
  },
};

// exports the current environment configurations
const envs = { development, test, production };
export default envs[app.env];
