CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN CREATE TYPE user_role AS ENUM ('admin', 'staff', 'user'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_sentiment') THEN CREATE TYPE ticket_sentiment AS ENUM ('Positive', 'Neutral', 'Negative', 'Urgent', 'Unknown'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_workflow_stage') THEN CREATE TYPE ticket_workflow_stage AS ENUM ('Triage', 'Analysis', 'Implementation', 'Testing', 'Deployment', 'Monitoring'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'impact_level') THEN CREATE TYPE impact_level AS ENUM ('Low', 'Medium', 'High', 'Critical'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'technical_complexity') THEN CREATE TYPE technical_complexity AS ENUM ('Simple', 'Moderate', 'Complex', 'Expert'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resolution_type') THEN CREATE TYPE resolution_type AS ENUM ('Configuration', 'Repair', 'Replacement', 'Training', 'Escalation'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN CREATE TYPE approval_status AS ENUM ('None', 'Pending', 'Approved', 'Rejected'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_category') THEN CREATE TYPE announcement_category AS ENUM ('General', 'System', 'Maintenance', 'Urgent'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_status') THEN CREATE TYPE chat_status AS ENUM ('active', 'closed'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_config_type') THEN CREATE TYPE email_config_type AS ENUM ('imap', 'smtp', 'forwarding'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_forwarding_status') THEN CREATE TYPE email_forwarding_status AS ENUM ('success', 'failed', 'error'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_test_result') THEN CREATE TYPE email_test_result AS ENUM ('success', 'failed', 'not_tested'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN CREATE TYPE feedback_type AS ENUM ('Bug Report', 'Feature Request', 'General Praise', 'Other'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN CREATE TYPE feedback_status AS ENUM ('New', 'Reviewed', 'Archived'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'it_availability') THEN CREATE TYPE it_availability AS ENUM ('Available', 'Busy', 'Away', 'Offline'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kb_category') THEN CREATE TYPE kb_category AS ENUM ('Getting Started', 'Common Issues', 'Advanced Topics', 'FAQ'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kb_difficulty') THEN CREATE TYPE kb_difficulty AS ENUM ('Beginner', 'Intermediate', 'Advanced'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kb_status') THEN CREATE TYPE kb_status AS ENUM ('Draft', 'Published', 'Under Review', 'Archived'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_user_registration_method') THEN CREATE TYPE new_user_registration_method AS ENUM ('signup_form', 'admin_created', 'staff_invitation', 'bulk_import'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_user_approval_status') THEN CREATE TYPE new_user_approval_status AS ENUM ('pending', 'approved', 'rejected'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_user_status') THEN CREATE TYPE new_user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_user_created_via') THEN CREATE TYPE new_user_created_via AS ENUM ('self_registration', 'admin_creation', 'bulk_import', 'api'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'system'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority') THEN CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_category') THEN CREATE TYPE notification_category AS ENUM ('ticket', 'system', 'account', 'security', 'update'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN CREATE TYPE staff_role AS ENUM ('IT Staff', 'IT Admin', 'Head IT', 'Senior IT'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_response_type') THEN CREATE TYPE ticket_response_type AS ENUM ('admin_response', 'it_solution', 'status_update', 'closure_note'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High'); END IF;
END $$;

CREATE OR REPLACE FUNCTION create_entity_table(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      data jsonb NOT NULL DEFAULT ''{}''::jsonb,
      created_by text,
      created_date timestamptz NOT NULL DEFAULT now(),
      updated_date timestamptz NOT NULL DEFAULT now()
    )',
    table_name
  );
END;
$$ LANGUAGE plpgsql;

SELECT create_entity_table('announcements');
SELECT create_entity_table('app_users');
SELECT create_entity_table('audit_logs');
SELECT create_entity_table('chatbot_configs');
SELECT create_entity_table('chatbot_faqs');
SELECT create_entity_table('chat_logs');
SELECT create_entity_table('chat_sessions');
SELECT create_entity_table('comments');
SELECT create_entity_table('email_forwarding_logs');
SELECT create_entity_table('email_notifications');
SELECT create_entity_table('email_server_configs');
SELECT create_entity_table('email_tickets');
SELECT create_entity_table('feedback');
SELECT create_entity_table('internal_emails');
SELECT create_entity_table('it_extensions');
SELECT create_entity_table('knowledge_base_articles');
SELECT create_entity_table('new_users');
SELECT create_entity_table('notifications');
SELECT create_entity_table('qr_access');
SELECT create_entity_table('staff');
SELECT create_entity_table('tickets');
SELECT create_entity_table('ticket_categories');
SELECT create_entity_table('ticket_notes');
SELECT create_entity_table('ticket_responses');
SELECT create_entity_table('ticket_routes');
SELECT create_entity_table('users');
SELECT create_entity_table('validation_requests');

-- Immutable wrapper functions for enum casting in generated columns
CREATE OR REPLACE FUNCTION to_user_role(v text) RETURNS user_role AS $$ SELECT NULLIF(v,'')::user_role $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_user_role_default(v text) RETURNS user_role AS $$ SELECT COALESCE(NULLIF(v,''),'user')::user_role $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_ticket_status(v text) RETURNS ticket_status AS $$ SELECT COALESCE(NULLIF(v,''),'Open')::ticket_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_ticket_sentiment(v text) RETURNS ticket_sentiment AS $$ SELECT COALESCE(NULLIF(v,''),'Unknown')::ticket_sentiment $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_ticket_workflow_stage(v text) RETURNS ticket_workflow_stage AS $$ SELECT NULLIF(v,'')::ticket_workflow_stage $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_impact_level(v text) RETURNS impact_level AS $$ SELECT NULLIF(v,'')::impact_level $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_approval_status(v text) RETURNS approval_status AS $$ SELECT COALESCE(NULLIF(v,''),'None')::approval_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_announcement_category(v text) RETURNS announcement_category AS $$ SELECT NULLIF(v,'')::announcement_category $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_chat_status(v text) RETURNS chat_status AS $$ SELECT COALESCE(NULLIF(v,''),'active')::chat_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_email_forwarding_status(v text) RETURNS email_forwarding_status AS $$ SELECT NULLIF(v,'')::email_forwarding_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_email_config_type(v text) RETURNS email_config_type AS $$ SELECT NULLIF(v,'')::email_config_type $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_email_test_result(v text) RETURNS email_test_result AS $$ SELECT COALESCE(NULLIF(v,''),'not_tested')::email_test_result $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_feedback_type(v text) RETURNS feedback_type AS $$ SELECT NULLIF(v,'')::feedback_type $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_feedback_status(v text) RETURNS feedback_status AS $$ SELECT COALESCE(NULLIF(v,''),'New')::feedback_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_it_availability(v text) RETURNS it_availability AS $$ SELECT COALESCE(NULLIF(v,''),'Available')::it_availability $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_kb_category(v text) RETURNS kb_category AS $$ SELECT NULLIF(v,'')::kb_category $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_kb_difficulty(v text) RETURNS kb_difficulty AS $$ SELECT NULLIF(v,'')::kb_difficulty $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_kb_status(v text) RETURNS kb_status AS $$ SELECT COALESCE(NULLIF(v,''),'Draft')::kb_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_new_user_registration_method(v text) RETURNS new_user_registration_method AS $$ SELECT COALESCE(NULLIF(v,''),'signup_form')::new_user_registration_method $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_new_user_approval_status(v text) RETURNS new_user_approval_status AS $$ SELECT COALESCE(NULLIF(v,''),'approved')::new_user_approval_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_new_user_status(v text) RETURNS new_user_status AS $$ SELECT COALESCE(NULLIF(v,''),'active')::new_user_status $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_new_user_created_via(v text) RETURNS new_user_created_via AS $$ SELECT COALESCE(NULLIF(v,''),'self_registration')::new_user_created_via $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_notification_type(v text) RETURNS notification_type AS $$ SELECT NULLIF(v,'')::notification_type $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_notification_priority(v text) RETURNS notification_priority AS $$ SELECT COALESCE(NULLIF(v,''),'medium')::notification_priority $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_notification_category(v text) RETURNS notification_category AS $$ SELECT NULLIF(v,'')::notification_category $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_staff_role(v text) RETURNS staff_role AS $$ SELECT COALESCE(NULLIF(v,''),'IT Staff')::staff_role $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_ticket_response_type(v text) RETURNS ticket_response_type AS $$ SELECT COALESCE(NULLIF(v,''),'admin_response')::ticket_response_type $$ LANGUAGE sql IMMUTABLE;
CREATE OR REPLACE FUNCTION to_priority_level(v text) RETURNS priority_level AS $$ SELECT NULLIF(v,'')::priority_level $$ LANGUAGE sql IMMUTABLE;

ALTER TABLE announcements ADD COLUMN IF NOT EXISTS category announcement_category GENERATED ALWAYS AS (to_announcement_category(data->>'category')) STORED;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS role user_role GENERATED ALWAYS AS (to_user_role_default(data->>'role')) STORED;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role GENERATED ALWAYS AS (to_user_role(data->>'role')) STORED;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status ticket_status GENERATED ALWAYS AS (to_ticket_status(data->>'status')) STORED;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sentiment ticket_sentiment GENERATED ALWAYS AS (to_ticket_sentiment(data->>'sentiment')) STORED;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS workflow_stage ticket_workflow_stage GENERATED ALWAYS AS (to_ticket_workflow_stage(data->>'workflow_stage')) STORED;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS customer_impact impact_level GENERATED ALWAYS AS (to_impact_level(data->>'customer_impact')) STORED;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS approval_status approval_status GENERATED ALWAYS AS (to_approval_status(data->>'approval_status')) STORED;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS status chat_status GENERATED ALWAYS AS (to_chat_status(data->>'status')) STORED;
ALTER TABLE email_forwarding_logs ADD COLUMN IF NOT EXISTS forwarding_status email_forwarding_status GENERATED ALWAYS AS (to_email_forwarding_status(data->>'forwarding_status')) STORED;
ALTER TABLE email_server_configs ADD COLUMN IF NOT EXISTS config_type email_config_type GENERATED ALWAYS AS (to_email_config_type(data->>'config_type')) STORED;
ALTER TABLE email_server_configs ADD COLUMN IF NOT EXISTS test_result email_test_result GENERATED ALWAYS AS (to_email_test_result(data->>'test_result')) STORED;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS type feedback_type GENERATED ALWAYS AS (to_feedback_type(data->>'type')) STORED;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status feedback_status GENERATED ALWAYS AS (to_feedback_status(data->>'status')) STORED;
ALTER TABLE it_extensions ADD COLUMN IF NOT EXISTS availability it_availability GENERATED ALWAYS AS (to_it_availability(data->>'availability')) STORED;
ALTER TABLE knowledge_base_articles ADD COLUMN IF NOT EXISTS category kb_category GENERATED ALWAYS AS (to_kb_category(data->>'category')) STORED;
ALTER TABLE knowledge_base_articles ADD COLUMN IF NOT EXISTS difficulty_level kb_difficulty GENERATED ALWAYS AS (to_kb_difficulty(data->>'difficulty_level')) STORED;
ALTER TABLE knowledge_base_articles ADD COLUMN IF NOT EXISTS status kb_status GENERATED ALWAYS AS (to_kb_status(data->>'status')) STORED;
ALTER TABLE new_users ADD COLUMN IF NOT EXISTS registration_method new_user_registration_method GENERATED ALWAYS AS (to_new_user_registration_method(data->>'registration_method')) STORED;
ALTER TABLE new_users ADD COLUMN IF NOT EXISTS approval_status new_user_approval_status GENERATED ALWAYS AS (to_new_user_approval_status(data->>'approval_status')) STORED;
ALTER TABLE new_users ADD COLUMN IF NOT EXISTS status new_user_status GENERATED ALWAYS AS (to_new_user_status(data->>'status')) STORED;
ALTER TABLE new_users ADD COLUMN IF NOT EXISTS created_via new_user_created_via GENERATED ALWAYS AS (to_new_user_created_via(data->>'created_via')) STORED;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type notification_type GENERATED ALWAYS AS (to_notification_type(data->>'type')) STORED;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority notification_priority GENERATED ALWAYS AS (to_notification_priority(data->>'priority')) STORED;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category notification_category GENERATED ALWAYS AS (to_notification_category(data->>'category')) STORED;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS role staff_role GENERATED ALWAYS AS (to_staff_role(data->>'role')) STORED;
ALTER TABLE ticket_responses ADD COLUMN IF NOT EXISTS response_type ticket_response_type GENERATED ALWAYS AS (to_ticket_response_type(data->>'response_type')) STORED;
ALTER TABLE ticket_responses ADD COLUMN IF NOT EXISTS new_priority priority_level GENERATED ALWAYS AS (to_priority_level(data->>'new_priority')) STORED;
ALTER TABLE ticket_responses ADD COLUMN IF NOT EXISTS new_status ticket_status GENERATED ALWAYS AS (to_ticket_status(data->>'new_status')) STORED;

ALTER TABLE ticket_responses ADD COLUMN IF NOT EXISTS ticket_id uuid GENERATED ALWAYS AS ((data->>'ticket_id')::uuid) STORED;
ALTER TABLE ticket_notes ADD COLUMN IF NOT EXISTS ticket_id uuid GENERATED ALWAYS AS ((data->>'ticket_id')::uuid) STORED;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS ticket_id uuid GENERATED ALWAYS AS ((data->>'ticket_id')::uuid) STORED;
ALTER TABLE email_tickets ADD COLUMN IF NOT EXISTS ticket_id uuid GENERATED ALWAYS AS ((data->>'ticket_id')::uuid) STORED;
ALTER TABLE ticket_routes ADD COLUMN IF NOT EXISTS ticket_id uuid GENERATED ALWAYS AS ((data->>'ticket_id')::uuid) STORED;
ALTER TABLE validation_requests ADD COLUMN IF NOT EXISTS ticket_id uuid GENERATED ALWAYS AS ((data->>'ticket_id')::uuid) STORED;
ALTER TABLE new_users ADD COLUMN IF NOT EXISTS user_id uuid GENERATED ALWAYS AS ((data->>'user_id')::uuid) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_uidx ON app_users (lower(data->>'email'));
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uidx ON users (lower(data->>'email')) WHERE data ? 'email';
CREATE UNIQUE INDEX IF NOT EXISTS tickets_ticket_number_uidx ON tickets ((data->>'ticket_number')) WHERE data ? 'ticket_number';
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS ticket_responses_ticket_id_idx ON ticket_responses (ticket_id);
CREATE INDEX IF NOT EXISTS ticket_notes_ticket_id_idx ON ticket_notes (ticket_id);
CREATE INDEX IF NOT EXISTS comments_ticket_id_idx ON comments (ticket_id);
CREATE INDEX IF NOT EXISTS notifications_sent_to_idx ON notifications ((data->>'sent_to'));
CREATE INDEX IF NOT EXISTS entity_created_date_idx_tickets ON tickets (created_date DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_responses_ticket_fk') THEN
    ALTER TABLE ticket_responses ADD CONSTRAINT ticket_responses_ticket_fk FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_notes_ticket_fk') THEN
    ALTER TABLE ticket_notes ADD CONSTRAINT ticket_notes_ticket_fk FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_ticket_fk') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_ticket_fk FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'new_users_user_fk') THEN
    ALTER TABLE new_users ADD CONSTRAINT new_users_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;
