import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import { toRecord } from '../utils/records.js';
import { validateRegisterBody } from '../schemas/authSchema.js';

async function findByEmail(email) {
  const result = await query(
    `SELECT * FROM app_users WHERE lower(data->>'email') = lower($1) LIMIT 1`,
    [email]
  );
  return toRecord(result.rows[0]);
}

export async function register(req, res, next) {
  try {
    const { email, password, full_name, role = 'user', ...profile } = req.body;
    if (!validateRegisterBody(req.body)) {
      return res.status(400).json({ message: 'email, password and full_name are required' });
    }
    const existing = await findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const password_digest = await bcrypt.hash(password, 12);
    const data = {
      email,
      full_name,
      role,
      password_hash: password,
      password_digest,
      is_active: true,
      registration_method: 'signup_form',
      ...profile
    };
    const result = await query(
      `INSERT INTO app_users (data, created_by) VALUES ($1::jsonb, $2) RETURNING *`,
      [JSON.stringify(data), email]
    );
    const user = toRecord(result.rows[0]);
    const { password_hash: _plain, password_digest: _hashed, ...publicProfile } = data;
    await query(
      `INSERT INTO users (id, data, created_by)
       VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (id) DO UPDATE SET data = users.data || EXCLUDED.data, updated_date = now()`,
      [user.id, JSON.stringify(publicProfile), email]
    );
    const token = signToken(user);
    const { password_hash: _password, password_digest: _digest, ...safeUser } = user;
    return res.status(201).json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user || (!user.password_digest && !user.password_hash)) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = user.password_digest
      ? await bcrypt.compare(password, user.password_digest)
      : user.password_hash === password;
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    await query(
      `UPDATE app_users SET data = data || $1::jsonb, updated_date = now() WHERE id = $2`,
      [JSON.stringify({ last_login: new Date().toISOString() }), user.id]
    );
    const token = signToken(user);
    const { password_hash: _password, password_digest: _digest, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Authentication required' });
    const result = await query('SELECT * FROM app_users WHERE id = $1', [req.user.id]);
    const user = toRecord(result.rows[0]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password_hash: _password, password_digest: _digest, ...safeUser } = user;
    return res.json(safeUser);
  } catch (error) {
    next(error);
  }
}
