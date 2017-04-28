import path from 'path';

export default {
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
};
