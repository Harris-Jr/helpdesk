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

    if (name === 'createUser') {
      const { email, full_name, role = 'user', department } = req.body;
      if (!email || !full_name) return res.status(400).json({ message: 'email and full_name are required' });
      const { query } = await import('../config/db.js');
      const { toRecord } = await import('../utils/records.js');
      const bcrypt = await import('bcryptjs');
      const existing = await query(`SELECT id FROM app_users WHERE lower(data->>'email') = lower($1)`, [email]);
      if (existing.rows.length > 0) return res.status(409).json({ message: 'Email already registered' });
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
      const tempPassword = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const password_digest = await bcrypt.default.hash(tempPassword, 12);
      const data = { email, full_name, role, department: department || null, is_active: true, password_digest, registration_method: 'admin_created' };
      const result = await query(`INSERT INTO app_users (data, created_by) VALUES ($1::jsonb, $2) RETURNING *`, [JSON.stringify(data), email]);
      const user = toRecord(result.rows[0]);
      const { password_digest: _d, ...publicProfile } = data;
      await query(`INSERT INTO users (id, data, created_by) VALUES ($1, $2::jsonb, $3) ON CONFLICT (id) DO UPDATE SET data = users.data || EXCLUDED.data, updated_date = now()`, [user.id, JSON.stringify(publicProfile), email]);
      await sendSystemEmail({ to: email, subject: 'Your OAG Helpdesk Account', body: `Hello ${full_name},\n\nYour account has been created.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.` });
      return res.status(201).json({ user, tempPassword });
    }

    if (name === 'resetUserPassword') {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId is required' });
      const { query } = await import('../config/db.js');
      const { toRecord } = await import('../utils/records.js');
      const bcrypt = await import('bcryptjs');
      const result = await query(`SELECT * FROM app_users WHERE id = $1`, [userId]);
      if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
      const user = toRecord(result.rows[0]);
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
      const tempPassword = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const password_digest = await bcrypt.default.hash(tempPassword, 12);
      await query(`UPDATE app_users SET data = data || $1::jsonb, updated_date = now() WHERE id = $2`, [JSON.stringify({ password_digest, password_hash: null }), userId]);
      await sendSystemEmail({ to: user.email, subject: 'OAG Helpdesk Password Reset', body: `Hello ${user.full_name},\n\nYour password has been reset.\n\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.` });
      return res.json({ message: 'Password reset. Email sent to ' + user.email, tempPassword });
    }

    return res.status(404).json({ message: `Unknown function: ${name}` });
  } catch (error) {
    next(error);
  }
});

export default router;
