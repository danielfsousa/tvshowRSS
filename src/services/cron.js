#!/usr/bin/env node

/* eslint-disable no-param-reassign */

import fs from 'fs';
import os from 'os';
import path from 'path';
import rarbg from 'rarbg';
import { padStart } from 'lodash';
import omdb from './omdb';
import TvShow from '../api/show/model';
import mongoose from './mongoose';
import config from '../config';
import filter from '../util/download';

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
    // Empties download links
    show.download = [];
    // Push new links
    data.forEach(filteredObj => show.download.push(filteredObj));
    // Return save mongoose model promise
    return show.save();
  };
}

function filterData(data) {
  return Promise.resolve(filter(data));
}

function retryWithLastSeason(show) {
  return function returnData() {
    const season = padStart(show.current_season - 1, 2, 0);
    return rarbg.search({
      search_string: `S${season} 1080p`,
      search_imdb: show.imdbID,
      category: rarbg.categories.TV_HD_EPISODES,
      sort: 'seeders',
    });
  };
}

function getMagnets(show) {
  const season = padStart(show.current_season, 2, 0);
  return rarbg.search({
    search_string: `S${season} 1080p`,
    search_imdb: show.imdbID,
    category: rarbg.categories.TV_HD_EPISODES,
    sort: 'seeders',
  });
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
        .then(filterData)
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
