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
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  
  // Test user credentials
  const userPassword = 'TestUser123!';
  const userPasswordHash = await bcrypt.hash(userPassword, 12);
  
  // Staff passwords
  const staffPassword1 = 'Staff123!Jane';
  const staffPassword2 = 'Staff123!David';
  const staffPasswordHash1 = await bcrypt.hash(staffPassword1, 12);
  const staffPasswordHash2 = await bcrypt.hash(staffPassword2, 12);
  
  const seed = seedTemplate
    .replaceAll('__ADMIN_EMAIL__', adminEmail.replaceAll("'", "''"))
    .replaceAll('__ADMIN_PASSWORD__', adminPassword.replaceAll("'", "''"))
    .replaceAll('__ADMIN_PASSWORD_HASH__', adminPasswordHash.replaceAll("'", "''"))
    .replaceAll('__USER_PASSWORD_HASH__', userPasswordHash.replaceAll("'", "''"))
    .replaceAll('__STAFF_PASSWORD_HASH_1__', staffPasswordHash1.replaceAll("'", "''"))
    .replaceAll('__STAFF_PASSWORD_HASH_2__', staffPasswordHash2.replaceAll("'", "''"));

  await pool.query(schema);
  await pool.query(seed);
  await pool.end();
  console.log(`Database initialized.`);
  console.log(`Admin:        ${adminEmail} / ${adminPassword}`);
  console.log(`User:         john.doe@ago.gov.zm / ${userPassword}`);
  console.log(`Staff 1:      jane.smith@ago.gov.zm / ${staffPassword1}`);
  console.log(`Staff 2:      david.mwale@ago.gov.zm / ${staffPassword2}`);
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
