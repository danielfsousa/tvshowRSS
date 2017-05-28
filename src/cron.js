#!/usr/bin/env node
/* eslint-disable no-param-reassign */

/**
 * Module dependencies.
 * @private
 */

import os from 'os';
import tvmaze from './services/tvmaze';
import TvShow from './api/show/model';
import mongoose from './services/mongoose';
import config from './config';
import { magnets, filter, save } from './util/magnets';
import { cron as logger } from './util/logger';

// Connect to database
mongoose.connect(config.mongo.uri);

/**
 * List of shows
 * @private
 */
const updated = [];
const failed = [];

/**
 * Add show name to the array of updated shows
 * @private
 *
 * @param {TvShow} show
 */
function success(show) {
  updated.push(show.name);
}

/**
 * Add show name and error message to the failed array
 *
 * @param {Object} err
 * @param {TvShow} show
 * @private
 */
function error(err, show) {
  console.log(err);
  failed.push({
    name: show.name,
    message: err.message || err.error,
  });
}

/**
 * Log results
 * @private
 */
function logResults() {
  console.log(); // new line
  updated.forEach((name, index) => {
    const eol = updated.length === index + 1 ? os.EOL : '';
    const logMessage = `UPDATED: "${name}"${eol}`;
    logger.info(logMessage);
  });
  failed.forEach((err, index) => {
    const eol = failed.length === index + 1 ? os.EOL : '';
    const logMessage = `FAILED: "${err.name}" (${err.message})${eol}`;
    logger.error(logMessage);
  });
}

/**
 * Get TvShow magnets from RARBG
 *
 * @param {TvShow} show
 * @returns {Promise}
 * @private
 */
function getMagnets(show) {
  return magnets(show);
}

async function updateSeason(show) {
  show.current_season = await tvmaze.getCurrentSeason(show);
  return Promise.resolve(show);
}

/**
 * Tries to update magnets of all TvShows
 *
 * @param {Array} shows
 * @returns {Promise} all TvShow's promises
 * @private
 */
function run(shows) {
  const promises = [];

  shows.forEach((show) => {
    // creates a Promise for each Show
    const p = new Promise((resolve, reject) => {
      updateSeason(show)
        .then(getMagnets)
        .then(filter)
        .then(save(show))
        .then(success)
        .then(resolve)
        .catch((err) => {
          error(err, show);
          reject();
        });
    });
    // add current promise to the List
    promises.push(p);
  });
  // return all Promises
  return Promise.all(promises);
}

/**
 * Set a delay before exiting the script
 * to ensure that all the results were logged
 *
 * @private
 */
function exit() {
  setTimeout(() => process.exit(), 10000);
}

/*!
 * Get all TvShows from database
 * and init chain of promises
 */
TvShow.find({})
  .then(run)
  .then(logResults)
  .catch(exit)
  .then(exit);
