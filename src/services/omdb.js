import omdb from 'omdb';

function get(type, show) {
  const params = type === 'imdb'
    ? { imdb: show.imdbID }
    : { title: show.name, type: 'series' };

  return new Promise((resolve, reject) => {
    omdb.get(params, (err, response) => {
      if (err) {
        reject(err);
      }
      if (!response) {
        const error = new Error('Tv show not found');
        error.status = 404;
        reject(error);
      }
      resolve(response);
    });
  });
}

export default { get };
