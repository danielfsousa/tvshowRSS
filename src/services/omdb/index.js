import omdb from './wrapper';

function getSeason(imdb) {
  return new Promise((resolve, reject) => {
    omdb.get({ imdb }, (err, show) => {
      if (err || !show) {
        reject();
      }
      resolve(show.season);
    });
  });
}

export default { getSeason };
