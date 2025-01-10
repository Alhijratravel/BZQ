-- Drop existing admin user if exists
DELETE FROM auth.users WHERE email = 'super@example.com';
DELETE FROM users WHERE email = 'super@example.com';

-- Create admin user in auth.users
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
  aud,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'super@example.com',
  crypt('super123', gen_salt('bf')), -- Using a more secure password
  now(),
  jsonb_build_object(
    'provider', 'email',
    'providers', array['email'],
    'role', 'admin'
  ),
  jsonb_build_object(
    'role', 'admin'
  ),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Insert into users table with admin role
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

-- Ensure proper RLS policies exist
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  DROP POLICY IF EXISTS "Admins can read all data" ON users;
  DROP POLICY IF EXISTS "Admins can update all data" ON users;
  
  -- Create new policies
  CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR role = 'admin');

  CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR role = 'admin');

  CREATE POLICY "Admins can read all data"
    ON users FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

  CREATE POLICY "Admins can update all data"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;