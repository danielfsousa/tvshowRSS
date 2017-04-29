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
    uri: process.env.MONGODB_URI_TESTS,
    options: {
      debug: false,
    },
  },
};

const production = {
  logs: { env: 'combined' },
  port: process.env.PORT || 8080,
  mongo: {
    uri: process.env.MONGODB_URI,
  },
};

// exports the current environment configurations
const envs = { development, test, production };
export default envs[process.env.NODE_ENV];
