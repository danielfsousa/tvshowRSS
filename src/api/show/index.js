import { Router } from 'express';
import getTvShowRSS from './controller';

const router = new Router();

router.get('/', getTvShowRSS);
router.get('/:name/:resolution', getTvShowRSS);
router.get('/:name', getTvShowRSS);
router.get('/imdb/:imdb/:resolution', getTvShowRSS);
router.get('/imdb/:imdb', getTvShowRSS);

export default router;
