import omdb from './wrapper';

function get(type, show) {
  const params = type === 'imdb'
    ? { imdb: show.imdbID }
    : { title: show.name, type: 'series' };

  return new Promise((resolve, reject) => {
    omdb.get(params, (err, response) => {
      if (err || !response) {
        reject();
      }
      resolve(response);
    });
  });
}

export default { get };
