import { Router } from 'express';
import getTvShowRSS from './controller';

const router = new Router();

router.get('/', getTvShowRSS);

export default router;
