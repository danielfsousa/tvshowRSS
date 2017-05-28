/*!
 * Module dependencies.
 */

import tvmaze from '../../services/tvmaze';
import TvShow from './model';
import Feed from '../../services/rss';
import { magnets, filter, save } from '../../util/magnets';
import { errorHandler } from '../../util/error';
import { logger } from '../../util/logger';
import { rss as defaults } from '../../config';

/**
 * Set locals properties on the Request object
 *
 * @param {Object} req
 * @private
 */
function setRequestLocals(req) {
  const isImdbID = /tt\d{7}/.test(req.params.idOrName);
  req.locals = {};
  req.locals.imdb = isImdbID ? req.params.idOrName : null;
  req.locals.name = isImdbID ? null : req.params.idOrName;
  req.locals.resolution = req.params.resolution || req.query.resolution;
}

/**
 * Send RSS Feed containing the show magnets
 *
 * @param {Object} req
 * @param {Object} res
 * @param {TvShow} show
 * @private
 */
function sendFeed(req, res, show) {
  if (show.magnets.length === 0) {
    const error = new Error('No download links found');
    error.status = 404;
    errorHandler(req, res)(error);
  }
  const rss = new Feed(show).create(req.locals.resolution);
  const xml = rss.xml({ indent: true });
  logger.info(`RESPONSE name: ${show.name} | imdbID: ${show.imdbID} | resolution: ${req.locals.resolution || defaults.resolution} | season: ${show.current_season} | magnets: ${show.magnets.length}`);
  res.header('Content-Type', 'text/xml; charset=UTF-8');
  res.send(xml);
}

/**
 * Creates a new TvShow mongoose object.
 * Fetch information data on tvmaze api.
 * Populates the TvShow object with the data fecthed.
 * Fetch download data on rarbg.
 * Filters the download data by episode and resolution.
 * Saves TvShow on database.
 * Sends RSS feed.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {String} type
 */
function newTvShow(req, res, type) {
  const show = new TvShow({
    imdbID: req.locals.imdb,
    name: req.locals.name,
  });

  const populate = (response) => {
    show.tvmazeID = response.id;
    show.imdbID = response.externals.imdb;
    show.name = response.name;
    show.current_season = response.current_season ? response.current_season : 1;
    return Promise.resolve(show);
  };

  tvmaze.get(type, show)
    .catch(errorHandler(req, res))
    .then(populate)
    .then(magnets)
    .then(filter)
    .then(save(show))
    .then(() => sendFeed(req, res, show))
    .catch(errorHandler(req, res));
}

/**
 * Get TVShow by IMDB ID
 *
 * @param {Object} req
 * @param {Object} res
 * @private
 */
function getById(req, res) {
  TvShow.findOne({ imdbID: req.locals.imdb })
        .then(show => (show ? sendFeed(req, res, show) : newTvShow(req, res, 'imdb')))
        .catch(errorHandler(req, res));
}

/**
 * Get TvShow by Name
 *
 * @param {Object} req
 * @param {Object} res
 * @private
 */
function getByName(req, res) {
  // removes leading/trailing whitespaces
  const name = req.locals.name.trim();
  // find the best result
  TvShow.findOne({ name: { $regex: name, $options: 'i' } })
        .then(show => (show ? sendFeed(req, res, show) : newTvShow(req, res, 'name')))
        .catch(errorHandler(req, res));
}

/**
 * GET TV SHOW MAGNETS BY [NAME] OR [IMDBID]
 *
 * /shows/:idOrName
 * /shows/:idOrName/:resolution
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @public
 * @export
 */
export default function getRssRouteHandler(req, res, next) {
  setRequestLocals(req);

  const imdb = req.locals.imdb;
  const name = req.locals.name;

  if (name) {
    logger.debug(`GET TV SHOW MAGNETS BY NAME: ${req.locals.name}`);
    getByName(req, res);
  } else if (imdb) {
    logger.debug(`GET TV SHOW MAGNETS BY IMDBID: ${req.locals.imdb}`);
    getById(req, res);
  } else {
    logger.debug('NAME AND IMDBID WERE NOT SET');
    next();
  }
}
