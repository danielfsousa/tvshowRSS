/**
 * Module dependencies.
 * @private
 */

import { merge } from 'lodash';
import path from 'path';
import nodeEnv from '../util/env';
import app from './app';
import logs from './logs';
import rss from './rss';
import environment from './environment';

// exports merged configuration object
module.exports = merge(app, rss, logs, environment);
export default module.exports;
