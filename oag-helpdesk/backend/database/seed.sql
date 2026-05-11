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
