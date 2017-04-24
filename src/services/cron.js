#!/usr/bin/env node

/* eslint-disable no-param-reassign */

import fs from 'fs';
import os from 'os';
import path from 'path';
import omdb from './omdb';
import TvShow from '../api/show/model';
import mongoose from './mongoose';
import config from '../config';
import { magnets, retry, filter } from '../util/download';

// Connect to Database
mongoose.connect(config.mongo.uri);

// Create LOG File
const logDir = path.join(__dirname, '../../log/cron.log');
if (!fs.existsSync(path.dirname(logDir))) {
  fs.mkdirSync(path.dirname(logDir));
}
const logFile = fs.createWriteStream(logDir, { flags: 'a' });

// List of updated Tv Shows
const updated = [];

function success(show) {
  updated.push(show.name);
}

function log(text) {
  logFile.write(`[${Date()}] ${text}`);
}

function logResults() {
  console.log(); // new line
  updated.forEach((name) => {
    const logMessage = `UPDATED: "${name}"${os.EOL}`;
    console.log(logMessage);
    log(logMessage);
  });
  logFile.close();
}

function logError(err, show) {
  const logMessage = `FAILED: "${show.name}" (${err.message || err.error})${os.EOL} `;
  console.log(logMessage, err);
  log(logMessage);
}

function getMagnets(show) {
  return magnets(show);
}

function updateSeason(show) {
  return new Promise((resolve, reject) => {
    omdb.get('imdb', show)
    .then((response) => {
      show.current_season = response.season;
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
        .then(getMagnets).catch(retry(show))
        .then(filter)
        .then(filtered => show.updateMagnets(filtered))
        .then(success)
        .then(resolve)
        .catch((err) => {
          logError(err, show);
          reject();
        });
    });
    // Add current promise to the List
    promises.push(p);
  });
  // Return all Promises
  return Promise.all(promises);
}

// ----------------------------------------------------- //

TvShow.find({})
  .then(run)
  .then(logResults)
  .catch(process.exit)
  .then(process.exit);
