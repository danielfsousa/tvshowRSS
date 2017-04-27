#!/usr/bin/env node

/* eslint-disable no-param-reassign */

import os from 'os';
import omdb from './services/omdb';
import TvShow from './api/show/model';
import mongoose from './services/mongoose';
import config from './config';
import { magnets, retry, filter, save } from './util/magnets';
import { cron as logger } from './util/logger';

// Connect to Database
mongoose.connect(config.mongo.uri);

// List of updated Tv Shows
const updated = [];
const failed = [];

function success(show) {
  updated.push(show.name);
}

function error(err, show) {
  failed.push({
    name: show.name,
    message: err.message || err.error,
  });
}

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

function getMagnets(show) {
  return magnets(show);
}

function updateSeason(show) {
  return new Promise((resolve, reject) => {
    omdb.get('imdb', show)
    .then((response) => {
      show.current_season = response.totalSeasons;
      resolve(show);
    })
    .catch(reject);
  });
}

function run(shows) {
  // List of Promises
  const promises = [];

  shows.forEach((show) => {
    // Creates a Promise for each Show
    const p = new Promise((resolve, reject) => {
      updateSeason(show)
        .then(getMagnets)
        .catch(retry(show))
        .then(filter)
        .then(save(show))
        .then(success)
        .then(resolve)
        .catch((err) => {
          error(err, show);
          reject();
        });
    });
    // Add current promise to the List
    promises.push(p);
  });
  // Return all Promises
  return Promise.all(promises);
}

function exit() {
  setTimeout(() => process.exit(), 10000);
}

// ----------------------------------------------------- //

TvShow.find({})
  .then(run)
  .then(logResults)
  .catch(exit)
  .then(exit);
