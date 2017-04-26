import { Router } from 'express';
import getTvShowRSS from './controller';

const router = new Router();

router.get('/:idOrName', getTvShowRSS);
router.get('/:idOrName/:resolution', getTvShowRSS);

export default router;
