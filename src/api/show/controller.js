import TvShow from './model';
import Feed from '../../services/rss';
import { magnets, filter } from '../../util/download';

function validate(req, res) {
  const message = {
    error: {
      code: 400,
      info: 'Please, provide a Name or ID parameter',
    },
  };
  if (req.query.name || req.query.id) {
    return true;
  }
  return res.status(message.error.code).json(message);
}

function sendFeed(res, show) {
  const rss = new Feed(show).create();
  const xml = rss.xml({ indent: true });
  res.header('Content-Type', 'text/xml; charset=UTF-8');
  res.send(xml);
}

function newTvShow(req, res, next) {
  // search omdb
  const show = new TvShow({
    imdbID: req.query.id,
    name: 'Mr. Robot',
    season: 2,
  });

  magnets(show)
    .then(filter)
    .then(show.save)
    .then(showObj => sendFeed(res, showObj))
    .catch(next);
}

function getById(req, res, next) {
  TvShow.findOne({ imdbID: req.query.id })
        .then(show => (show ? sendFeed(res, show) : newTvShow(req, res, next)))
        .catch(next);
}

function getByName(req, res, next) {
  // TODO
  return req.query.name === true;
}

export default function getTvShowRSS(req, res, next) {
  validate(req, res);

  const id = req.query.id;
  const name = req.query.name;

  if (name) {
    getByName(req, res, next);
  } else if (id) {
    getById(req, res, next);
  }
}
