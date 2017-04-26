import { padStart, pick } from 'lodash';
import rarbg from 'rarbg';
import TvShow from '../api/show/model';

export function filter(rarbgData) {
  const regexEP = /S\d+E\d+/i;
  const regex1080p = /1080p/i;
  const regex720p = /720p/i;

  // Map of episodes identifiers
  // ex: epMap.set('S02E01', {'title': 'abc', 'link': 'abc.com'})
  const epMap = new Map();

  rarbgData.forEach((obj) => {
    // Episode identifier
    // ex: S02E01
    const [episode] = obj.filename.match(regexEP) || [];

    // if map does not have a magnets object then creates one
    if (!epMap.has(episode)) {
      epMap.set(episode, {
        sd: {},
        _720p: {},
        _1080p: {},
      });
    }

    // if magnet link is 1080p and we haven't pushed one 1080p link yet
    if (regex1080p.test(obj.filename) && !('link' in epMap.get(episode)._1080p)) {
      // Creates new 1080p object
      const new1080p = {
        title: obj.filename,
        link: obj.download,
      };
      // Updates the 1080p object from the epMap
      epMap.get(episode)._1080p = new1080p;
    } // eslint-disable-line

    // if magnet link is 720p and we haven't pushed one 720p link yet
    else if (regex720p.test(obj.filename) && !('link' in epMap.get(episode)._720p)) {
      // Creates new 720p object
      const new720p = {
        title: obj.filename,
        link: obj.download,
      };
      // Updates the 720p object from the epMap
      epMap.get(episode)._720p = new720p;
    } // eslint-disable-line

    // if magnet link is not 720p and 1080p
    // and we haven't pushed one SD link yet
    else if (
      !(regex720p.test(obj.filename) || regex1080p.test(obj.filename))
      &&
      !('link' in epMap.get(episode).sd)
    ) {
      // Creates new SD object
      const newSD = {
        title: obj.filename,
        link: obj.download,
      };
      // Updates the SD object from the epMap
      epMap.get(episode).sd = newSD;
    }
  });

  // Convert episodes Map to an Array
  const filteredData = [];
  epMap.forEach(val => filteredData.push(val));

  // return the filtered Array
  return Promise.resolve(filteredData);
}

export function magnets(show, previousSeasons = 0) {
  const season = show.current_season - previousSeasons;
  const fmtSeason = `S${padStart(season, 2, 0)}`;

  const options = {
    search_string: `${show.name} ${fmtSeason}`,
    sort: 'seeders',
    limit: 100,
  };

  if (show.imdb) {
    options.search_imdb = show.imdbID;
    options.search_string = fmtSeason;
  }

  return rarbg.search(options);
}

export function retry(show) {
  return function tryAgain() {
    if (!(show.imdbID && show.name)) {
      const error = new Error('Tv show not found');
      error.status = 404;
      return Promise.reject(error);
    }
    if (show.current_season <= 1) {
      const error = new Error('No download links found');
      error.status = 404;
      return Promise.reject(error);
    }
    return magnets(show, 1).catch(() => magnets(show, 2));
  };
}

export function save(show) {
  return (filteredMagnets) => {
    const updated = show;
    // Empties array
    updated.magnets = [];
    // Push new links
    filteredMagnets.forEach(magnetObj => updated.magnets.push(magnetObj));
    // Try to update model
    return updated.save().catch(() => {
      // If a document with the same imdbID already exists
      // Get updated properties
      const updatedProps = pick(updated, ['current_season', 'magnets']);
      // Update that one
      TvShow.update({ imdbID: show.imdbID }, updatedProps);
    });
  };
}
