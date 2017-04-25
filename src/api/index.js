import { Router } from 'express';
import show from './show';

const router = new Router();

router.use('/shows', show);

export default router;
