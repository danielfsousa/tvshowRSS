/**
 * Module dependencies.
 * @private
 */

import { padStart, includes } from 'lodash';
import RSS from 'rss';
import { parseString } from 'xml2js';
import { rss as defaults } from '../config';
import { logger } from '../util/logger';

/**
 * Available resolutions constants.
 * @public
 * @export
 */
export const resolutions = {
  SD: 'sd',
  HD: '720p',
  FULLHD: '1080p',
};

/**
 * Represents a RSS Feed for a TvShow
 *
 * @class Feed
 * @public
 * @export
 */
export default class Feed {

  /**
   * Creates an instance of Feed
   *
   * @param {TvShow} tvShow
   * @memberOf Feed
   */
  constructor(tvShow) {
    this.tvShow = tvShow;

    const fmtSeason = `Season: ${padStart(tvShow.current_season, 2, 0)}`;
    this.config = {
      title: `${defaults.title}: ${tvShow.name}`,
      description: `${defaults.description} ${tvShow.name}. ${fmtSeason}`,
      site_url: defaults.link,
      ttl: defaults.ttl,
    };
  }

  /**
   * Generates XML and returns as a string for this feed.
   *
   * @param {string} videoResolution
   * @returns {string}
   *
   * @memberOf Feed
   */
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

  /**
   * Parses RSS from a string and returns a Promise
   *
   * @param {string} str
   * @returns {Promise}
   */
  static parse(str) {
    return new Promise((resolve, reject) => {
      parseString(str, (err, xml) => {
        if (err) reject(err);

        const feedObj = {
          title: xml.rss.channel[0].title[0],
          description: xml.rss.channel[0].description[0],
          items: [],
        };

        xml.rss.channel[0].item.forEach((obj) => {
          const newItem = Object.assign({}, obj);
          newItem.enclosure = obj.enclosure[0].$;
          newItem.title = obj.title[0];
          newItem.description = obj.description[0];
          newItem.guid = obj.guid[0]._;
          newItem.pubDate = obj.pubDate[0];
          feedObj.items.push(newItem);
        });

        resolve(feedObj);
      });
    });
  }
}
