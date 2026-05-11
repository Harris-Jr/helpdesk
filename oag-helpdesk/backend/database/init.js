import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const schema = await fs.readFile(path.join(__dirname, 'migrations', '001_initial_schema.sql'), 'utf8');
  const seedTemplate = await fs.readFile(path.join(__dirname, 'seed.sql'), 'utf8');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ago.gov.zm';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword00';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const seed = seedTemplate
    .replaceAll('__ADMIN_EMAIL__', adminEmail.replaceAll("'", "''"))
    .replaceAll('__ADMIN_PASSWORD__', adminPassword.replaceAll("'", "''"))
    .replaceAll('__ADMIN_PASSWORD_HASH__', passwordHash.replaceAll("'", "''"));

  await pool.query(schema);
  await pool.query(seed);
  await pool.end();
  console.log(`Database initialized. Admin user: ${adminEmail}`);
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
