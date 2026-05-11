import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ticketController from '../controllers/ticketController.js';

describe('ticket controller', () => {
  it('should be defined', () => {
    assert.ok(ticketController);
  });
});
