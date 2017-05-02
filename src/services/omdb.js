/**
 * Module dependencies.
 * @private
 */

import omdb from 'omdb';

/**
 * Get omdb data
 *
 * @param {string} [type='imdb']
 * @param {TvShow} show
 * @returns {Promise}
 */
function get(type = 'imdb', show) {
  return new Promise((resolve, reject) => {
    if (!show) reject('Parameter show was not passed');

    let params;
    if (type === 'imdb') {
      params = { imdb: show.imdbID };
    } else if (type === 'name') {
      params = { title: show.name, type: 'series' };
    } else {
      reject(new Error('type must be "imdb" or "name"'));
    }

    omdb.get(params, (err, response) => {
      if (err) {
        reject(err);
      }
      if (!response) {
        const error = new Error('Tv show not found');
        error.status = 404;
        reject(error);
      }
      resolve(response);
    });
  });
}

// Exports module
export default { get };
