import omdb from '../../services/omdb';
import TvShow from './model';
import Feed from '../../services/rss';
import { magnets, retry, filter } from '../../util/download';
import { error } from '../../util/error';

function setRequestProperties(req) {
  req.getprop = {};
  req.getprop.imdb = req.params.imdb || req.query.imdb;
  req.getprop.name = req.params.name || req.query.name;
  req.getprop.resolution = req.params.resolution || req.query.resolution;
}

function validate(req, res) {
  const message = {
    error: {
      code: 400,
      info: 'Please, provide a "name" or "imdb" parameter',
    },
  };
  if (req.getprop.name || req.getprop.imdb) {
    return true;
  }
  return res.status(message.error.code).json(message);
}

function sendFeed(req, res, show) {
  const rss = new Feed(show).create(req.getprop.resolution);
  const xml = rss.xml({ indent: true });
  res.header('Content-Type', 'text/xml; charset=UTF-8');
  res.send(xml);
}

function newTvShow(req, res, type) {
  const show = new TvShow({
    imdbID: req.getprop.imdb,
    name: req.getprop.name,
  });

  function populate(response) {
    show.imdbID = response.imdb.id;
    show.name = response.title;
    show.current_season = response.season;
    return show.save();
  }

  omdb.get(type, show)
    .then(populate)
    .then(magnets).catch(retry(show))
    .then(filter)
    .then(filtered => show.updateMagnets(filtered))
    .then(showObj => sendFeed(req, res, showObj))
    .catch(error(req, res));
}

function getById(req, res) {
  TvShow.findOne({ imdbID: req.getprop.imdb })
        .then(show => (show ? sendFeed(req, res, show) : newTvShow(req, res, 'imdb')))
        .catch(error(req, res));
}

export function getByName(req, res) {
  // removes leading/trailing whitespaces
  const name = req.getprop.name.trim();
  // find the best result
  TvShow.findOne({ name: { $regex: name, $options: 'i' } })
        .then(show => (show ? sendFeed(req, res, show) : newTvShow(req, res, 'name')))
        .catch(error(req, res));
}

export default function getTvShowRSS(req, res, next) {
  setRequestProperties(req);
  validate(req, res);

  const imdb = req.getprop.imdb;
  const name = req.getprop.name;

  if (name) {
    getByName(req, res);
  } else if (imdb) {
    getById(req, res);
  } else {
    next();
  }
}
