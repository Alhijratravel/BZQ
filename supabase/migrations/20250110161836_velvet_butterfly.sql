-- Create superadmin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'super@example.com',
  crypt('Super', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  now(),
  now(),
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Insert into users table
INSERT INTO users (
  id,
  email,
  role,
  created_at,
  last_login
)
SELECT 
  id,
  email,
  'admin',
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'super@example.com';

-- Grant admin role
UPDATE auth.users
SET raw_user_meta_data = '{"role":"admin"}'
WHERE email = 'super@example.com';