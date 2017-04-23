#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';
import rarbg from 'rarbg';
import TvShow from '../api/show/model';
import mongoose from './mongoose';
import config from '../config';
import filter from '../util/download';

mongoose.connect(config.mongo.uri);

const logDir = path.join(__dirname, '../../log/cron.log');
if (!fs.existsSync(path.dirname(logDir))) {
  fs.mkdirSync(path.dirname(logDir));
}
const logFile = fs.createWriteStream(logDir, { flags: 'a' });

// List of updated Tv Shows
const updated = [];

function log(text) {
  logFile.write(`[${Date()}] ${text}`);
}

function updateTvShow(show) {
  return function setData(data) {
    /* eslint-disable */
    show.download = [];
    /* eslint-enable */
    data.forEach(filteredObj => show.download.push(filteredObj));
    // Return save mongoose model promise
    return show.save();
  };
}

function filterData(data) {
  return Promise.resolve(filter(data));
}

function searchNewLinks(show) {
  return rarbg.search({
    search_string: `${show.current_season} 1080p`,
    search_imdb: show.imdbID,
    category: rarbg.categories.TV_HD_EPISODES,
    sort: 'seeders',
  });
}

function run(shows) {
  // List of Promises
  const promises = [];

  shows.forEach((show) => {
    // Creates a Promise for each Show
    const p = new Promise((resolve, reject) => {
      searchNewLinks(show)
        .then(filterData)
        .then(updateTvShow(show))
        .then(() => updated.push(show.name))
        .then(() => resolve())
        .catch((err) => {
          const logMessage = `FAILED: "${show.name}"${os.EOL}`;
          console.log(logMessage, err);
          log(logMessage);
          reject();
        });
    });
    // Add current promise to the List
    promises.push(p);
  });

  // Return all Promises
  return Promise.all(promises);
}

TvShow.find({})
  .then(run)
  .then(() => {
    console.log(); // new line
    updated.forEach((name) => {
      const logMessage = `UPDATED: "${name}"${os.EOL}`;
      console.log(logMessage);
      log(logMessage);
    });
    logFile.close();
  })
  .then(process.exit)
  .catch(err => console.log(err));

