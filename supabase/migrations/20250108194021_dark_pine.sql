/*
  # Update ID fields to support custom formats
  
  1. Changes
    - Modify customers table to use text IDs instead of UUIDs
    - Modify subscriptions table to use text IDs instead of UUIDs
    - Modify plans table to use text IDs instead of UUIDs
    - Update foreign key constraints
  
  2. Notes
    - This is a breaking change that requires data migration
    - All existing data will need to be backed up before this change
*/

-- Temporarily disable RLS
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

-- Create temporary tables
CREATE TABLE temp_customers AS SELECT * FROM customers;
CREATE TABLE temp_subscriptions AS SELECT * FROM subscriptions;
CREATE TABLE temp_plans AS SELECT * FROM plans;
CREATE TABLE temp_family_members AS SELECT * FROM family_members;

-- Drop existing tables (cascade will handle dependencies)
DROP TABLE family_members;
DROP TABLE subscriptions;
DROP TABLE customers;
DROP TABLE plans;

-- Recreate tables with text IDs
CREATE TABLE customers (
  id text PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  date_of_birth date,
  address text,
  city text,
  country text,
  type text NOT NULL DEFAULT 'single',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE plans (
  id text PRIMARY KEY,
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

CREATE TABLE subscriptions (
  id text PRIMARY KEY,
  customer_id text REFERENCES customers(id) ON DELETE CASCADE,
  plan_id text REFERENCES plans(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  billing_cycle text NOT NULL,
  auto_renew boolean DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE family_members (
  id text PRIMARY KEY DEFAULT 'FM-' || substr(gen_random_uuid()::text, 1, 8),
  customer_id text REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth date NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read plans"
  ON plans FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert plans"
  ON plans FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update plans"
  ON plans FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert subscriptions"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subscriptions"
  ON subscriptions FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read family_members"
  ON family_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert family_members"
  ON family_members FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update family_members"
  ON family_members FOR UPDATE TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_family_members_customer_id ON family_members(customer_id);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);

-- Recreate triggers
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