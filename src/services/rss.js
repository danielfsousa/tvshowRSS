import _ from 'lodash';
import RSS from 'rss';
import { rss as defaults } from '../config';

export default class Feed {

    constructor (tvShow) {
        const fmtSeason = `Season: ${_.padStart(tvShow.current_season, 2, 0)}`;
        this.tvShow = tvShow;
        this.config = {
            title: `${defaults.title}: ${tvShow.name}`,
            description: `${defaults.description} ${tvShow.name}. ${fmtSeason}`,
            site_url: defaults.link,
            ttl: defaults.ttl
        }
    }

    create() {
        const rss = new RSS(this.config);
        const tvShow = this.tvShow;

        tvShow.download.forEach(download => {
            rss.item({
                title: download.title,
                description: `Download ${download.title}`,
                enclosure: {
                    'url'  : download._1080p || download._720p || download.sd,
                    'length' : 0,
                    'type' : 'application/x-bittorrent'
                },
                url: download._1080p || download._720p || download.sd,
                date: download._id.getTimestamp()
            });
        });

        return rss;
    }

}