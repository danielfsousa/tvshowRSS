import _ from 'lodash';
import { Router } from 'express';

const router = new Router();

router.get('/', (req, res, next) => {
    res.send({ name: 'Mr. Robot', year: '2014' });
});

export default router;