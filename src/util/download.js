import { padStart } from 'lodash';
import rarbg from 'rarbg';

export function filter(rarbgData) {
  const regex = /S\d+E\d+/i;
  const episodes = [];

  function filterData(obj) {
    const [episode] = obj.filename.match(regex) || [];

    if (episodes.indexOf(episode) > -1) {
      return false;
    }
    episodes.push(episode);
    return true;
  }

  function mapData(obj) {
    return { title: obj.filename, _1080p: obj.download };
  }

  return Promise.resolve(rarbgData.filter(filterData).map(mapData));
}

export function magnets(show, previousSeasons) {
  const season = show.current_season - previousSeasons;
  const fmtSeason = padStart(season, 2, 0);

  return rarbg.search({
    search_string: `S${fmtSeason} 1080p`,
    search_imdb: show.imdbID,
    category: rarbg.categories.TV_HD_EPISODES,
    sort: 'seeders',
  });
}
