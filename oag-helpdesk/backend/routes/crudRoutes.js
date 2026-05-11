import { Router } from 'express';

export function crudRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.post('/filter', (req, res, next) => {
    req.query.filter = req.body || {};
    controller.list(req, res, next);
  });
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
}
