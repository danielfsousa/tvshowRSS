export default function filter(data) {
  const regex = /S\d+E\d+/i;
  const episodes = [];

  return data
        .filter((obj) => {
          const [episode] = obj.filename.match(regex) || [];

          if (episodes.indexOf(episode) > -1) {
            return false;
          }
          episodes.push(episode);
          return true;
        })
        .map(obj => ({ title: obj.filename, _1080p: obj.download }));
}
