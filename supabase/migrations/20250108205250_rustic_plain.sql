/*
  # Fix Database Schema

  1. Changes
    - Drop existing tables to ensure clean state
    - Recreate tables with correct data types and constraints
    - Add proper indexes and RLS policies
    - Set up triggers and functions
*/

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS payment_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Create base tables
CREATE TABLE customers (
  id text PRIMARY KEY DEFAULT 'CUS-' || substr(gen_random_uuid()::text, 1, 8),
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
  id text PRIMARY KEY DEFAULT 'PLN-' || substr(gen_random_uuid()::text, 1, 8),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  billing_cycle text NOT NULL,
  max_family_members integer NOT NULL CHECK (max_family_members > 0),
  features text[],
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE subscriptions (
  id text PRIMARY KEY DEFAULT 'SUB-' || substr(gen_random_uuid()::text, 1, 8),
  customer_id text REFERENCES customers(id) ON DELETE CASCADE,
  plan_id text REFERENCES plans(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date,
  billing_cycle text NOT NULL,
  auto_renew boolean DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  last_payment_date timestamptz,
  next_payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT subscriptions_end_date_check CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE TABLE family_members (
  id text PRIMARY KEY DEFAULT 'FAM-' || substr(gen_random_uuid()::text, 1, 8),
  customer_id text REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth date NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE payment_methods (
  id text PRIMARY KEY DEFAULT 'PM-' || substr(gen_random_uuid()::text, 1, 8),
  customer_id text REFERENCES customers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sepa', 'ideal')),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'failed')),
  last_four text,
  iban text,
  bank_name text,
  holder_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE payments (
  id text PRIMARY KEY DEFAULT 'PAY-' || substr(gen_random_uuid()::text, 1, 8),
  subscription_id text REFERENCES subscriptions(id) ON DELETE SET NULL,
  customer_id text REFERENCES customers(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method text NOT NULL CHECK (payment_method IN ('sepa', 'ideal')),
  payment_provider_reference text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE payment_logs (
  id text PRIMARY KEY DEFAULT 'LOG-' || substr(gen_random_uuid()::text, 1, 8),
  payment_id text REFERENCES payments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  status text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
  id text PRIMARY KEY DEFAULT 'NOT-' || substr(gen_random_uuid()::text, 1, 8),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 255),
  message text NOT NULL CHECK (char_length(message) >= 5 AND char_length(message) <= 1000),
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete customers" ON customers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read plans" ON plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert plans" ON plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update plans" ON plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete plans" ON plans FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read subscriptions" ON subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete subscriptions" ON subscriptions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read family_members" ON family_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert family_members" ON family_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update family_members" ON family_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete family_members" ON family_members FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read own payment methods" ON payment_methods FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = payment_methods.customer_id));

CREATE POLICY "Users can read own payments" ON payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = payments.customer_id));

CREATE POLICY "Users can read own payment logs" ON payment_logs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM payments p
    WHERE p.id = payment_logs.payment_id
    AND EXISTS (SELECT 1 FROM customers c WHERE c.id = p.customer_id)
  ));

CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_plans_active ON plans(active);
CREATE INDEX idx_plans_created_at ON plans(created_at);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX idx_family_members_customer_id ON family_members(customer_id);
CREATE INDEX idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate subscription end date
CREATE OR REPLACE FUNCTION calculate_subscription_end_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.billing_cycle = 'monthly' THEN
    NEW.end_date := NEW.start_date + INTERVAL '1 month';
  ELSIF NEW.billing_cycle = 'half_yearly' THEN
    NEW.end_date := NEW.start_date + INTERVAL '6 months';
  ELSIF NEW.billing_cycle = 'yearly' THEN
    NEW.end_date := NEW.start_date + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set end_date
CREATE TRIGGER set_subscription_end_date
  BEFORE INSERT OR UPDATE OF start_date, billing_cycle
  ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_subscription_end_date();

-- Create function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND read = true;
END;
$$ LANGUAGE plpgsql;