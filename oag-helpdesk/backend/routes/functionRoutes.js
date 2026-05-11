import { Router } from 'express';
import { sendSystemEmail } from '../utils/email.js';
import { healthCheck } from '../config/db.js';

const router = Router();

router.post('/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    if (name === 'sendSystemEmail' || name === 'SendEmail') {
      return res.json(await sendSystemEmail(req.body));
    }
    if (name === 'systemHealthCheck') {
      return res.json(await healthCheck());
    }
    if (name === 'databaseSync') {
      return res.json({ success: true, message: 'PostgreSQL is the source of truth' });
    }
    if (name === 'invokeLLM' || name === 'InvokeLLM') {
      return res.json({ response: 'AI integration is not configured on this sovereign stack.' });
    }
    return res.status(404).json({ message: `Unknown function: ${name}` });
  } catch (error) {
    next(error);
  }
});

export default router;
