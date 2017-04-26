#!/usr/bin/env node

/* eslint-disable no-param-reassign */

import fs from 'fs';
import os from 'os';
import path from 'path';
import omdb from './src/services/omdb';
import TvShow from './src/api/show/model';
import mongoose from './src/services/mongoose';
import config from './src/config';
import { magnets, retry, filter, save } from './src/util/magnets';

// Connect to Database
mongoose.connect(config.mongo.uri);

// Create LOG File
const logDir = path.join(__dirname, 'logs/cron.log');
if (!fs.existsSync(path.dirname(logDir))) {
  fs.mkdirSync(path.dirname(logDir));
}
const logFile = fs.createWriteStream(logDir, { flags: 'a' });

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

function write(text) {
  logFile.write(`[${Date()}] ${text}`);
}

function logResults() {
  console.log(); // new line
  updated.forEach((name) => {
    const logMessage = `UPDATED: "${name}"${os.EOL}`;
    console.log(logMessage);
    write(logMessage);
  });
  failed.forEach((err) => {
    const logMessage = `FAILED: "${err.name}" (${err.message})${os.EOL} `;
    console.log(logMessage);
    write(logMessage);
  });
  logFile.close();
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

// ----------------------------------------------------- //

TvShow.find({})
  .then(run)
  .then(logResults)
  .catch(process.exit)
  .then(process.exit);
