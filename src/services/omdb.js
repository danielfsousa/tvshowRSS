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
  const params = type === 'imdb'
    ? { imdb: show.imdbID }
    : { title: show.name, type: 'series' };

  return new Promise((resolve, reject) => {
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
