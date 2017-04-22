import { spawn, exec } from 'child_process';
import rarbg from 'rarbg';
import TvShow from '../api/show/model';

function updateTvShow(data) {
    // TODO
}

function searchNewLinks(show) {
  rarbg.search({
    search_string: `${show.current_season} 1080p`,
    search_imdb: show.imdbid,
    category: rarbg.categories.TV_HD_EPISODES,
    sort: 'seeders',
  })
    .then(updateTvShow);
}

function loopShows(shows) {
  shows.forEach((show) => {
    searchNewLinks(show);
  });
}

TvShow.find({})
    .then(loopShows)
    .catch(err => console.log(err));
