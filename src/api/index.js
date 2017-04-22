import { Router } from 'express';
import user from './user';
import show from './show';

const router = new Router();

router.use('/users', user);
router.use('/shows', show);

export default router;
