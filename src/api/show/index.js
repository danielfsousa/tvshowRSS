import _ from 'lodash';
import { Router } from 'express';
import tvShow from '../../services/tvShow';
import getTvShowRSS from './controller';
import TvShow from './model';

const router = new Router();

router.get('/', getTvShowRSS);

// TEMP
router.post('/', (req, res, next) => {
    TvShow.create({ 
        imdbID: req.query.id || Math.round(Math.random() * 1000).toString(),
        name: req.query.name,
        current_season: 2,
        download: {
            title: 'Mr. Robot 2x12 eps2.9_pyth0n-pt2.p7z',
            episode: 1,
            sd: 'download.com',
            _720p: '720p.com',
            _1080p: '1080p.com'
        }
    })
    .then(() => {
        res.send('salvou');
    })
    .catch((err) => {
        console.log(err);
        res.send({ error: err });
    });
});

router.get('/test', (req, res, next) => {
    tvShow.dir
        .then((data) => {
            res.send(data);
        })
        .catch(next);
});

export default router;