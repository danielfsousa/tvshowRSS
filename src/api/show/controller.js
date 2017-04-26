import omdb from '../../services/omdb';
import TvShow from './model';
import Feed from '../../services/rss';
import { magnets, retry, filter, save } from '../../util/magnets';
import { errorHandler } from '../../util/error';

function setRequestProperties(req) {
  const isImdbID = /tt\d{7}/.test(req.params.idOrName);
  req.locals = {};
  req.locals.imdb = isImdbID ? req.params.idOrName : null;
  req.locals.name = isImdbID ? null : req.params.idOrName;
  req.locals.resolution = req.params.resolution || req.query.resolution;
}

function sendFeed(req, res, show) {
  if (show.magnets.length === 0) {
    const error = new Error('No download links found');
    error.status = 404;
    errorHandler(req, res)(error);
  }

  const rss = new Feed(show).create(req.locals.resolution);
  const xml = rss.xml({ indent: true });
  res.header('Content-Type', 'text/xml; charset=UTF-8');
  res.send(xml);
}

function newTvShow(req, res, type) {
  const show = new TvShow({
    imdbID: req.locals.imdb,
    name: req.locals.name,
  });

  function populate(response) {
    show.imdbID = response.imdb.id;
    show.name = response.title;
    show.current_season = response.totalSeasons;
    return Promise.resolve(show);
  }

  omdb.get(type, show)
    .catch(errorHandler(req, res))
    .then(populate)
    .then(magnets)
    .catch(retry(show))
    .then(filter)
    .then(save(show))
    .then(() => sendFeed(req, res, show))
    .catch(errorHandler(req, res));
}

function getById(req, res) {
  TvShow.findOne({ imdbID: req.locals.imdb })
        .then(show => (show ? sendFeed(req, res, show) : newTvShow(req, res, 'imdb')))
        .catch(errorHandler(req, res));
}

export function getByName(req, res) {
  // removes leading/trailing whitespaces
  const name = req.locals.name.trim();
  // find the best result
  TvShow.findOne({ name: { $regex: name, $options: 'i' } })
        .then(show => (show ? sendFeed(req, res, show) : newTvShow(req, res, 'name')))
        .catch(errorHandler(req, res));
}

export default function getTvShowRSS(req, res, next) {
  setRequestProperties(req);

  const imdb = req.locals.imdb;
  const name = req.locals.name;

  if (name) {
    getByName(req, res);
  } else if (imdb) {
    getById(req, res);
  } else {
    next();
  }
}
