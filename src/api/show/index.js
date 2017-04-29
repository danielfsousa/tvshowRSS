import { Router } from 'express';
import getRssRouteHandler from './controller';

const router = new Router();

router.get('/:idOrName', getRssRouteHandler);
router.get('/:idOrName/:resolution', getRssRouteHandler);

export default router;
