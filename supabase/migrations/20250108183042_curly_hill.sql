/*
  # Initial Schema Setup

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - created_at (timestamp)
      - last_login (timestamp)
    
    - customers
      - id (uuid, primary key)
      - first_name (text)
      - last_name (text)
      - email (text, unique)
      - phone (text)
      - date_of_birth (date)
      - address (text)
      - city (text)
      - country (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - plans
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - price (numeric)
      - billing_cycle (text)
      - max_family_members (integer)
      - features (text[])
      - active (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - subscriptions
      - id (uuid, primary key)
      - customer_id (uuid, foreign key)
      - plan_id (uuid, foreign key)
      - start_date (date)
      - billing_cycle (text)
      - auto_renew (boolean)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - family_members
      - id (uuid, primary key)
      - subscription_id (uuid, foreign key)
      - name (text)
      - date_of_birth (date)
      - relationship (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - message (text)
      - type (text)
      - read (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'employee',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  date_of_birth date,
  address text,
  city text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Plans table
CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  billing_cycle text NOT NULL,
  max_family_members integer NOT NULL,
  features text[],
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read plans"
  ON plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert plans"
  ON plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update plans"
  ON plans
  FOR UPDATE
  TO authenticated
  USING (true);

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  plan_id uuid REFERENCES plans(id),
  start_date date NOT NULL,
  billing_cycle text NOT NULL,
  auto_renew boolean DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Family members table
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id),
  name text NOT NULL,
  date_of_birth date NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read family_members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert family_members"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update family_members"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (true);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();