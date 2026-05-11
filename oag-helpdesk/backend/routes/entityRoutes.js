import { Router } from 'express';
import { genericEntityController } from '../controllers/genericEntityController.js';
import ticketController from '../controllers/ticketController.js';
import userController from '../controllers/userController.js';
import { getEntityConfig } from '../config/entityDefinitions.js';

const router = Router();

function controllerFor(entity) {
  getEntityConfig(entity);
  if (entity === 'Ticket') return ticketController;
  if (entity === 'User') return userController;
  return genericEntityController(entity);
}

router.get('/:entity', (req, res, next) => controllerFor(req.params.entity).list(req, res, next));
router.post('/:entity/filter', (req, res, next) => {
  req.query.filter = req.body || {};
  controllerFor(req.params.entity).list(req, res, next);
});
router.get('/:entity/:id', (req, res, next) => controllerFor(req.params.entity).getById(req, res, next));
router.post('/:entity', (req, res, next) => controllerFor(req.params.entity).create(req, res, next));
router.put('/:entity/:id', (req, res, next) => controllerFor(req.params.entity).update(req, res, next));
router.patch('/:entity/:id', (req, res, next) => controllerFor(req.params.entity).update(req, res, next));
router.delete('/:entity/:id', (req, res, next) => controllerFor(req.params.entity).delete(req, res, next));

export default router;
