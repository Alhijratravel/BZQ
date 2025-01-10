/*
  # Update Schema for Links and APIs

  1. Changes
    - Add missing foreign key relationships
    - Add indexes for better performance
    - Add missing columns for analytics
    - Update RLS policies

  2. New Columns
    - Add tracking columns for analytics
    - Add status tracking columns
    - Add metadata columns

  3. Security
    - Update RLS policies for better access control
    - Add row-level security for new tables
*/

-- Add missing columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Add missing columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS trial_end_date date,
ADD COLUMN IF NOT EXISTS cancellation_date date,
ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Add missing columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attempt_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_attempt_date timestamptz;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id text PRIMARY KEY DEFAULT 'EVT-' || substr(gen_random_uuid()::text, 1, 8),
  event_type text NOT NULL,
  customer_id text REFERENCES customers(id) ON DELETE SET NULL,
  subscription_id text REFERENCES subscriptions(id) ON DELETE SET NULL,
  payment_id text REFERENCES payments(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "Authenticated users can read analytics_events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert analytics_events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_customer_id ON analytics_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create function to track analytics events
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_event_type text,
  p_customer_id text DEFAULT NULL,
  p_subscription_id text DEFAULT NULL,
  p_payment_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
) RETURNS void AS $$
BEGIN
  INSERT INTO analytics_events (
    event_type,
    customer_id,
    subscription_id,
    payment_id,
    metadata
  ) VALUES (
    p_event_type,
    p_customer_id,
    p_subscription_id,
    p_payment_id,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track customer events
CREATE OR REPLACE FUNCTION track_customer_events()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM track_analytics_event('customer_created', NEW.id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status != OLD.status THEN
      PERFORM track_analytics_event('customer_status_changed', NEW.id, NULL, NULL, 
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_customer_events
  AFTER INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION track_customer_events();

-- Create trigger to track subscription events
CREATE OR REPLACE FUNCTION track_subscription_events()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM track_analytics_event('subscription_created', NEW.customer_id, NEW.id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status != OLD.status THEN
      PERFORM track_analytics_event('subscription_status_changed', NEW.customer_id, NEW.id, NULL,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_subscription_events
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION track_subscription_events();

-- Create trigger to track payment events
CREATE OR REPLACE FUNCTION track_payment_events()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM track_analytics_event('payment_created', NEW.customer_id, NEW.subscription_id, NEW.id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status != OLD.status THEN
      PERFORM track_analytics_event('payment_status_changed', NEW.customer_id, NEW.subscription_id, NEW.id,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_payment_events
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION track_payment_events();