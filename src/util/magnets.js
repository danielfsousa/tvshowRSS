/**
 * Module dependencies.
 * @private
 */

import { padStart, pick } from 'lodash';
import rarbg from 'rarbg';
import TvShow from '../api/show/model';
import { logger } from './logger';

/**
 * Filter RARBG data by Episode and Resolution
 *
 * Returns: [{
 *              sd: { tile: 'abc', link: 'magnet:?xt=urn:btih...' },
 *              _720p: { tile: 'abc', link: 'magnet:?xt=urn:btih...' },
 *              _1080p: { tile: 'abc', link: 'magnet:?xt=urn:btih...' },
 *          }]
 *
 * @public
 * @export
 * @param {Array} rarbgData
 * @returns {Promise} resolved to a magnets Array
 */
export function filter(rarbgData) {
  const regexEP = /S\d+E\d+/i;
  const regex1080p = /1080p/i;
  const regex720p = /720p/i;

  // Map of episodes identifiers
  // ex: epMap.set('S02E01', {'title': 'abc', 'link': 'abc.com'})
  const epMap = new Map();

  logger.debug('DOWNLOAD MAGNETS FILTERED:');
  rarbgData.forEach((obj) => {
    // Episode identifier
    // ex: S02E01
    const [episode] = obj.filename.match(regexEP) || [];

    // if map does not have a magnets object then creates one
    if (!epMap.has(episode)) {
      epMap.set(episode, {
        sd: {},
        _720p: {},
        _1080p: {},
      });
    }

    // if magnet link is 1080p and we haven't pushed one 1080p link yet
    if (regex1080p.test(obj.filename) && !('link' in epMap.get(episode)._1080p)) {
      logger.debug(`1080p: ${obj.filename}`);
      // Creates new 1080p object
      const new1080p = {
        title: obj.filename,
        link: obj.download,
      };
      // Updates the 1080p object from the epMap
      epMap.get(episode)._1080p = new1080p;
    } // eslint-disable-line

    // if magnet link is 720p and we haven't pushed one 720p link yet
    else if (regex720p.test(obj.filename) && !('link' in epMap.get(episode)._720p)) {
      logger.debug(`720p: ${obj.filename}`);
      // Creates new 720p object
      const new720p = {
        title: obj.filename,
        link: obj.download,
      };
      // Updates the 720p object from the epMap
      epMap.get(episode)._720p = new720p;
    } // eslint-disable-line

    // if magnet link is not 720p and 1080p
    // and we haven't pushed one SD link yet
    else if (
      !(regex720p.test(obj.filename) || regex1080p.test(obj.filename))
      &&
      !('link' in epMap.get(episode).sd)
  ) {
      logger.debug(`SD: ${obj.filename}`);
      // Creates new SD object
      const newSD = {
        title: obj.filename,
        link: obj.download,
      };
      // Updates the SD object from the epMap
      epMap.get(episode).sd = newSD;
    }
  });

  // Convert episodes Map to an Array
  const filteredData = [];
  epMap.forEach(val => filteredData.push(val));

  return Promise.resolve(filteredData);
}

/**
 * Get magnets from RARBG
 *
 * @public
 * @export
 * @param {TvShow} show
 * @param {number} [previousSeasons=0]
 * @returns {Promise}
 */
export function magnets(show, previousSeasons = 0) {
  if (typeof previousSeasons !== 'number') {
    return Promise.reject(new Error('Parameter "previousSeasons" is not a number'));
  }
  if (!show) {
    return Promise.reject(new Error('Parameter "show" is obrigatory'));
  }

  const season = (show.current_season || 1) - previousSeasons;
  const fmtSeason = `S${padStart(season, 2, 0)}`;

  const options = {
    search_string: `${show.name} ${fmtSeason}`,
    sort: 'seeders',
    limit: 100,
  };

  if (show.imdbID) {
    options.search_imdb = show.imdbID;
    options.search_string = fmtSeason;
  }

  return rarbg.search(options);
}

/**
 * Subtracts 1 or 2 numbers from TvShow current season
 * and try to get magnets from RARBG again
 *
 * @public
 * @export
 * @param {TvShow} show
 * @returns {Promise} of {@link magnets}
 */
export function retry(show) {
  logger.info(`MAGNETS NOT FOUND: ${show.name}. TRYING AGAIN...`);
  return function tryAgain() {
    if (!(show.imdbID && show.name)) {
      const error = new Error('Tv show not found');
      error.status = 404;
      return Promise.reject(error);
    }
    if (show.current_season <= 1) {
      const error = new Error('No download links found');
      error.status = 404;
      return Promise.reject(error);
    }
    return magnets(show, 1).catch(() => magnets(show, 2));
  };
}

/**
 * Updates TvShow magnets and saves it.
 *
 * @export
 * @param {TvShow} show
 * @returns {Promise}
 */
export function save(show) {
  return (filteredMagnets) => {
    if (!(show instanceof TvShow)) {
      return Promise.reject(new Error('Parameter show is not a TvShow instance'));
    }

    const updated = show;
    // Empties array
    updated.magnets = [];
    // Push new links
    filteredMagnets.forEach(magnetObj => updated.magnets.push(magnetObj));
    // Try to update model
    return updated.save().catch(() => {
      logger.warn(`${show.name} WAS FOUND ON DATABSE. UPDATING THE DOCUMENT...`);
      // If a document with the same imdbID already exists
      // Get updated properties
      const updatedProps = pick(updated, ['current_season', 'magnets']);
      // Update that one
      TvShow.update({ imdbID: show.imdbID }, updatedProps);
    });
  };
}
