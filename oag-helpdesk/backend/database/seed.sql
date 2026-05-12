INSERT INTO app_users (data, created_by)
SELECT
  jsonb_build_object(
    'email', '__ADMIN_EMAIL__',
    'full_name', 'OAG Administrator',
    'role', 'admin',
    'province', 'National',
    'district', 'Head Office',
    'job_title', 'System Administrator',
    'password_hash', '__ADMIN_PASSWORD__',
    'password_digest', '__ADMIN_PASSWORD_HASH__',
    'is_active', true,
    'has_completed_onboarding', true,
    'registration_method', 'admin_created'
  ),
  '__ADMIN_EMAIL__'
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE lower(data->>'email') = lower('__ADMIN_EMAIL__')
);

UPDATE app_users
SET data = data || jsonb_build_object(
      'email', '__ADMIN_EMAIL__',
      'full_name', 'OAG Administrator',
      'role', 'admin',
      'province', 'National',
      'district', 'Head Office',
      'job_title', 'System Administrator',
      'password_hash', '__ADMIN_PASSWORD__',
      'password_digest', '__ADMIN_PASSWORD_HASH__',
      'is_active', true,
      'has_completed_onboarding', true,
      'registration_method', 'admin_created'
    ),
    updated_date = now()
WHERE lower(data->>'email') = lower('__ADMIN_EMAIL__');

INSERT INTO users (id, data, created_by)
SELECT id, data - 'password_hash' - 'password_digest', created_by
FROM app_users
WHERE lower(data->>'email') = lower('__ADMIN_EMAIL__')
ON CONFLICT (id) DO UPDATE
SET data = users.data || EXCLUDED.data,
    updated_date = now();

-- Test User (Regular citizen/employee)
INSERT INTO app_users (data, created_by)
SELECT
  jsonb_build_object(
    'email', 'john.doe@ago.gov.zm',
    'full_name', 'John Doe',
    'role', 'user',
    'province', 'Lusaka',
    'district', 'Lusaka',
    'job_title', 'Government Employee',
    'password_hash', 'john.doe@ago.gov.zm',
    'password_digest', '__USER_PASSWORD_HASH__',
    'is_active', true,
    'has_completed_onboarding', true,
    'registration_method', 'admin_created'
  ),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE lower(data->>'email') = 'john.doe@ago.gov.zm'
);

UPDATE app_users
SET data = data || jsonb_build_object(
      'email', 'john.doe@ago.gov.zm',
      'full_name', 'John Doe',
      'role', 'user',
      'province', 'Lusaka',
      'district', 'Lusaka',
      'job_title', 'Government Employee',
      'password_hash', 'john.doe@ago.gov.zm',
      'password_digest', '__USER_PASSWORD_HASH__',
      'is_active', true,
      'has_completed_onboarding', true,
      'registration_method', 'admin_created'
    ),
    updated_date = now()
WHERE lower(data->>'email') = 'john.doe@ago.gov.zm';

INSERT INTO users (id, data, created_by)
SELECT id, data - 'password_hash' - 'password_digest', created_by
FROM app_users
WHERE lower(data->>'email') = 'john.doe@ago.gov.zm'
ON CONFLICT (id) DO UPDATE
SET data = users.data || EXCLUDED.data,
    updated_date = now();

-- Staff Member 1
INSERT INTO app_users (data, created_by)
SELECT
  jsonb_build_object(
    'email', 'jane.smith@ago.gov.zm',
    'full_name', 'Jane Smith',
    'role', 'staff',
    'province', 'Lusaka',
    'district', 'Head Office',
    'job_title', 'Helpdesk Staff',
    'password_hash', 'jane.smith@ago.gov.zm',
    'password_digest', '__STAFF_PASSWORD_HASH_1__',
    'is_active', true,
    'has_completed_onboarding', true,
    'registration_method', 'admin_created'
  ),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE lower(data->>'email') = 'jane.smith@ago.gov.zm'
);

UPDATE app_users
SET data = data || jsonb_build_object(
      'email', 'jane.smith@ago.gov.zm',
      'full_name', 'Jane Smith',
      'role', 'staff',
      'province', 'Lusaka',
      'district', 'Head Office',
      'job_title', 'Helpdesk Staff',
      'password_hash', 'jane.smith@ago.gov.zm',
      'password_digest', '__STAFF_PASSWORD_HASH_1__',
      'is_active', true,
      'has_completed_onboarding', true,
      'registration_method', 'admin_created'
    ),
    updated_date = now()
WHERE lower(data->>'email') = 'jane.smith@ago.gov.zm';

INSERT INTO users (id, data, created_by)
SELECT id, data - 'password_hash' - 'password_digest', created_by
FROM app_users
WHERE lower(data->>'email') = 'jane.smith@ago.gov.zm'
ON CONFLICT (id) DO UPDATE
SET data = users.data || EXCLUDED.data,
    updated_date = now();

-- Staff Member 2
INSERT INTO app_users (data, created_by)
SELECT
  jsonb_build_object(
    'email', 'david.mwale@ago.gov.zm',
    'full_name', 'David Mwale',
    'role', 'staff',
    'province', 'Lusaka',
    'district', 'Head Office',
    'job_title', 'Senior Helpdesk Officer',
    'password_hash', 'david.mwale@ago.gov.zm',
    'password_digest', '__STAFF_PASSWORD_HASH_2__',
    'is_active', true,
    'has_completed_onboarding', true,
    'registration_method', 'admin_created'
  ),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE lower(data->>'email') = 'david.mwale@ago.gov.zm'
);

UPDATE app_users
SET data = data || jsonb_build_object(
      'email', 'david.mwale@ago.gov.zm',
      'full_name', 'David Mwale',
      'role', 'staff',
      'province', 'Lusaka',
      'district', 'Head Office',
      'job_title', 'Senior Helpdesk Officer',
      'password_hash', 'david.mwale@ago.gov.zm',
      'password_digest', '__STAFF_PASSWORD_HASH_2__',
      'is_active', true,
      'has_completed_onboarding', true,
      'registration_method', 'admin_created'
    ),
    updated_date = now()
WHERE lower(data->>'email') = 'david.mwale@ago.gov.zm';

INSERT INTO users (id, data, created_by)
SELECT id, data - 'password_hash' - 'password_digest', created_by
FROM app_users
WHERE lower(data->>'email') = 'david.mwale@ago.gov.zm'
ON CONFLICT (id) DO UPDATE
SET data = users.data || EXCLUDED.data,
    updated_date = now();

-- Staff table entries
INSERT INTO staff (data, created_by)
SELECT
  jsonb_build_object(
    'email', 'jane.smith@ago.gov.zm',
    'full_name', 'Jane Smith',
    'department', 'Helpdesk',
    'phone_number', '+260-211-123456',
    'is_active', true
  ),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM staff WHERE lower(data->>'email') = 'jane.smith@ago.gov.zm'
);

INSERT INTO staff (data, created_by)
SELECT
  jsonb_build_object(
    'email', 'david.mwale@ago.gov.zm',
    'full_name', 'David Mwale',
    'department', 'Helpdesk',
    'phone_number', '+260-211-654321',
    'is_active', true
  ),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM staff WHERE lower(data->>'email') = 'david.mwale@ago.gov.zm'
);
