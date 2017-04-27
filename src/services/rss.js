import { padStart, includes } from 'lodash';
import RSS from 'rss';
import { rss as defaults } from '../config';
import { logger } from '../util/logger';

export const resolutions = {
  SD: 'sd',
  HD: '720p',
  FULLHD: '1080p',
};

export default class Feed {

  static get resolutions() {
    return resolutions;
  }

  constructor(tvShow) {
    const fmtSeason = `Season: ${padStart(tvShow.current_season, 2, 0)}`;
    this.tvShow = tvShow;
    this.config = {
      title: `${defaults.title}: ${tvShow.name}`,
      description: `${defaults.description} ${tvShow.name}. ${fmtSeason}`,
      site_url: defaults.link,
      ttl: defaults.ttl,
    };
  }

  create(videoResolution) {
    let res = '';

    // Check if resolution requested by the user is valid
    if (includes(resolutions, videoResolution)) {
      logger.debug(`REQUESTED RESOLUTION: ${videoResolution}`);
      // Add an underscore if resolution beggins with a number
      res = videoResolution.includes('p') ? `_${videoResolution}` : videoResolution;
    } else {
      logger.debug(`RESOLUTION ID NOT SET OR NOR VALID. DEFAULT: ${defaults.resolution}`);
      // Add default resolution
      res = `_${defaults.resolution}`;
    }

    const rss = new RSS(this.config);
    const tvShow = this.tvShow;

    tvShow.magnets.forEach((magnet) => {
      rss.item({
        title: magnet[res].title,
        description: `Download ${magnet[res].title}`,
        enclosure: {
          url: magnet[res].link,
          length: 0,
          type: 'application/x-bittorrent',
        },
        date: magnet._id.getTimestamp(),
      });
    });

    return rss;
  }

}
