import rarbg from 'rarbg';
import TvShow from './model';
import Feed from '../../services/rss';
import filter from '../../util/download';

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

function sendMagnet(res, show) {
  const rss = new Feed(show).create();
  const xml = rss.xml({ indent: true });
  res.header('Content-Type', 'text/xml; charset=UTF-8');
  res.send(xml);
}

function newTvShow(req, res, next) {
  const imdbid = req.query.id;
  const name = 'Mr. Robot';
  const search = req.query.search;
  const season = 2;

  rarbg.search({
    search_string: search,
    search_imdb: imdbid,
    category: rarbg.categories.TV_HD_EPISODES,
    sort: 'seeders',
  })
    .then(data => TvShow.create({
      imdbID: imdbid,
      name,
      current_season: season, // preciso saber disso
      download: filter(data),
    }))
    .then(show => sendMagnet(res, show))
    .catch(next);
}

function getById(req, res, next, id) {
  TvShow.findOne({ imdbID: id })
        .then(show => (show ? sendMagnet(res, show) : newTvShow(req, res, next)))
        .catch(next);
}

function getByName(req, res, next, name) {
  // TODO
  return name === true;
}

export default function getTvShowRSS(req, res, next) {
  validate(req, res);

  const id = req.query.id;
  const name = req.query.name;

  if (name) {
    getByName(req, res, next, name);
  } else if (id) {
    getById(req, res, next, id);
  }
}
