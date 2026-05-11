import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { login, me, register } from '../controllers/authController.js';

describe('auth controller', () => {
  it('should be defined', () => {
    assert.ok(login);
    assert.ok(me);
    assert.ok(register);
  });
});
