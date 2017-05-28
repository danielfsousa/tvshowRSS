import request from 'request-promise-native';
import moment from 'moment-timezone';
import { logger } from '../util/logger';

const BASE_URL = 'http://api.tvmaze.com/';

const url = path => `${BASE_URL}${path}`;

/**
 * Callback to handle errors and resolves or rejects a Promise
 *
 * @param {any} resolve
 * @param {any} reject
 * @private
 */
async function apiRequest(options) {
  const optionsCopy = options;
  optionsCopy.json = true;

  try {
    const response = await request(optionsCopy);
    return Promise.resolve(response);
  } catch (e) {
    const err = new Error('Tv show not found');
    err.status = 404;
    return Promise.reject(err);
  }
}

/**
 * Parses the data received from tvmaze
 * to find the current season of the show
 *
 * @param {any} data
 * @returns {Number} Current season
 */
function parseNumberOfSeasons(data) {
  let seasons;
  try {
    seasons = data._embedded.seasons;
  } catch (e) {
    logger.error('parseNumberOfSeasons: Data does not have a "seasons" property');
    return 1;
  }

  let i = seasons.length - 1;
  while (i >= 0) {
    const premiereDate = seasons[i].premiereDate;

    if (+moment(premiereDate) <= +moment()) {
      return seasons[i].number;
    }

    i -= 1;
  }
  return 1;
}

/**
 * Get tv-show's seasons info from tvmaze api
 *
 * @param {any} show
 * @param {String} embed
 * @returns {Promise}
 */
async function singleShow(show, embed = 'seasons') {
  const options = { qs: { embed } };
  if (show.tvmazeID) {
    options.url = url(`shows/${show.tvmazeID}`);
  } else if (show.name) {
    options.url = url('singlesearch/shows');
    options.qs.q = show.name;
  } else {
    return Promise.reject(new Error('Show does not have a name and tvmazeID'));
  }
  return apiRequest(options);
}

async function lookup(id, type = 'imdb') {
  const uri = url(`lookup/shows?${type}=${id}`);
  const response = await apiRequest({ uri });
  return response;
}

/**
 * Get current season of the show
 *
 * @export
 * @param {String} show
 * @returns {Promise}
 */
async function getCurrentSeason(show) {
  try {
    const response = await singleShow(show);
    const currentSeason = parseNumberOfSeasons(response);
    return currentSeason;
  } catch (e) {
    throw e;
  }
}

/**
 * Get data by imdbID
 *
 * @param {string} imdb
 * @returns {Promise}
 * @private
 */
async function getByIMDB(imdb) {
  try {
    const lookupResponse = await lookup(imdb);
    return singleShow({ tvmazeID: lookupResponse.id });
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
* Get data by name
*
* @param {string} name
* @returns {Promise}
* @private
*/
async function getByName(name) {
  return singleShow({ name });
}

/**
 * Get tvshow info from tvmaze by imdbID or Name
 *
 * @param {string} [type='imdb']
 * @param {any} show
 * @returns {Promise}
 */
async function get(type = 'imdb', show) {
  try {
    if (!show) return Promise.reject('Parameter show was not passed');

    let response;
    if (type === 'imdb') {
      response = await getByIMDB(show.imdbID);
    } else if (type === 'name') {
      response = await getByName(show.name);
    } else {
      return Promise.reject(new Error('type must be "imdb" or "name"'));
    }
    response.current_season = parseNumberOfSeasons(response);
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
}

export default { get, getCurrentSeason };
