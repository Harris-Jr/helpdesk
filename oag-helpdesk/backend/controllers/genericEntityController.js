import { createCrudController } from './crudController.js';

export function genericEntityController(entityName) {
  return createCrudController(entityName);
}
