import _ from 'lodash';
import { Router } from 'express';

const router = new Router();

router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

export default router;
