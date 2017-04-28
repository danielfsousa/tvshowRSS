/**
 * Module dependencies.
 * @private
 */

import { merge } from 'lodash';
import path from 'path';
import app from './app';
import logs from './logs';
import rss from './rss';
import environment from './environment';

// import .env
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

// exports merged configuration object
module.exports = merge(app, rss, logs, environment);
export default module.exports;
