/*
  # Payment System Setup
  
  1. New Tables
    - payment_methods (stored payment methods)
    - payments (payment transactions)
    - payment_logs (payment event history)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
  
  3. Performance
    - Add indexes for common queries
    - Add updated_at triggers
*/

-- Add payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
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

-- Add payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
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

-- Add payment_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_logs (
  id text PRIMARY KEY DEFAULT 'LOG-' || substr(gen_random_uuid()::text, 1, 8),
  payment_id text REFERENCES payments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  status text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_methods' 
    AND policyname = 'Users can read own payment methods'
  ) THEN
    CREATE POLICY "Users can read own payment methods"
      ON payment_methods FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM customers c
        WHERE c.id = payment_methods.customer_id
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Users can read own payments'
  ) THEN
    CREATE POLICY "Users can read own payments"
      ON payments FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM customers c
        WHERE c.id = payments.customer_id
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_logs' 
    AND policyname = 'Users can read own payment logs'
  ) THEN
    CREATE POLICY "Users can read own payment logs"
      ON payment_logs FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM payments p
        WHERE p.id = payment_logs.payment_id
        AND EXISTS (
          SELECT 1 FROM customers c
          WHERE c.id = p.customer_id
        )
      ));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Add trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payment_methods_updated_at'
  ) THEN
    CREATE TRIGGER update_payment_methods_updated_at
      BEFORE UPDATE ON payment_methods
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create function to update subscription payment dates if it doesn't exist
CREATE OR REPLACE FUNCTION update_subscription_payment_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE subscriptions
    SET 
      last_payment_date = NEW.created_at,
      next_payment_date = CASE billing_cycle
        WHEN 'monthly' THEN NEW.created_at + INTERVAL '1 month'
        WHEN 'half_yearly' THEN NEW.created_at + INTERVAL '6 months'
        WHEN 'yearly' THEN NEW.created_at + INTERVAL '1 year'
      END
    WHERE id = NEW.subscription_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment completion if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_subscription_on_payment'
  ) THEN
    CREATE TRIGGER update_subscription_on_payment
      AFTER INSERT OR UPDATE OF status ON payments
      FOR EACH ROW
      EXECUTE FUNCTION update_subscription_payment_dates();
  END IF;
END $$;