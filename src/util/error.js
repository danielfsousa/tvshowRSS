/**
 * Module dependencies.
 * @private
 */

import { logger } from './logger';

/**
 * Handle errors
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Function} to use in a promises chain
 * @public
 * @export
 */
export function errorHandler(req, res) {
  return (err) => {
    // Return if there is no error
    if (!err) return;

    res.locals.message = err.message ||
      (err.error === 'No results found' ? 'No download links found' : '');

    res.locals.status = err.status ||
      (err.error === 'No results found' ? 404 : 500);

    // render the error page if headers were not sent
    if (!res.headersSent) {
      logger.error(err);
      logger.info(`RESPONSE code: ${res.locals.status} | message: ${res.locals.message}`);
      res.status(res.locals.status);
      res.send({ error: {
        code: res.locals.status,
        message: res.locals.message,
      } }).end();
    }
  };
}

/**
 * Last route. If no other route was matched
 *
 * @param {Object} req
 * @param {Object} res
 * @public
 * @export
 */
export function badRequest(req, res) {
  const host = `${req.get('host')}/shows/`;
  const code = 400;
  const message = `Api usage: ${host}<nameOrImdbID>/<resolution> or ${host}<nameOrImdbID>?resolution=<resolution>`;
  logger.info(`RESPONSE code: ${code} | message: ${message}`);
  res.status(400).send({ error: { code, message } });
}

