#!/usr/bin/env node

/* eslint-disable no-param-reassign */

import fs from 'fs';
import os from 'os';
import path from 'path';
import omdb from './omdb';
import TvShow from '../api/show/model';
import mongoose from './mongoose';
import config from '../config';
import { magnets, filter } from '../util/download';

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
  const logMessage = `FAILED: "${show.name}"${os.EOL}`;
  console.log(logMessage, err);
  log(logMessage);
}

function update(show) {
  return function setData(data) {
    // Empties magnets
    show.magnets = [];
    // Push new links
    data.forEach(filteredData => show.magnets.push(filteredData));
    // Return save mongoose model promise
    return show.save();
  };
}

function retryWithLastSeason(show) {
  return function returnData() {
    return magnets(show, 1);
  };
}

function getMagnets(show) {
  return magnets(show);
}

function updateSeason(show) {
  return new Promise((resolve, reject) => {
    omdb.getSeason(show.imdbID)
    .then((season) => {
      show.current_season = season;
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
        .then(getMagnets).catch(retryWithLastSeason(show))
        .then(filter)
        .then(update(show))
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
  .catch(err => console.log(err))
  .then(process.exit);
