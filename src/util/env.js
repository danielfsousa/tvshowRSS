const path = require('path');

// import .env variables
const isTest = process.env.NODE_ENV === 'test';
require('dotenv-safe').load({ // eslint-disable-line
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});
// set env to test if it was run by mocha
export default process.env.NODE_ENV = isTest ? 'test' : process.env.NODE_ENV;
