/*
  # Fix Payment Analytics Migration

  1. Changes
    - Drop all dependent objects with CASCADE
    - Recreate trigger function with proper error handling
    - Add proper indexes and constraints

  2. Improvements
    - Better error handling
    - Input validation
    - Performance optimizations
*/

-- Drop all dependent objects with CASCADE
DROP TRIGGER IF EXISTS update_analytics_on_payment ON payments CASCADE;
DROP TRIGGER IF EXISTS update_payment_analytics_trigger ON payments CASCADE;
DROP FUNCTION IF EXISTS update_payment_analytics() CASCADE;

-- Create subscription_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_analytics (
  id text PRIMARY KEY DEFAULT 'SAN-' || substr(gen_random_uuid()::text, 1, 8),
  subscription_id text REFERENCES subscriptions(id) ON DELETE CASCADE,
  total_payments numeric DEFAULT 0,
  successful_payments integer DEFAULT 0,
  failed_payments integer DEFAULT 0,
  average_payment_amount numeric DEFAULT 0,
  last_payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT subscription_analytics_subscription_id_key UNIQUE (subscription_id)
);

-- Create new trigger function with proper error handling
CREATE OR REPLACE FUNCTION update_payment_analytics()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription record;
BEGIN
  -- Validate subscription_id
  IF NEW.subscription_id IS NULL THEN
    RAISE EXCEPTION 'subscription_id cannot be null';
  END IF;

  -- Verify subscription exists
  SELECT * INTO v_subscription 
  FROM subscriptions 
  WHERE id = NEW.subscription_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription with id % not found', NEW.subscription_id;
  END IF;

  -- Insert or update subscription analytics
  INSERT INTO subscription_analytics (
    subscription_id,
    total_payments,
    successful_payments,
    failed_payments,
    average_payment_amount,
    last_payment_date
  )
  VALUES (
    NEW.subscription_id,
    COALESCE(NEW.amount, 0),
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    COALESCE(NEW.amount, 0),
    CASE WHEN NEW.status = 'completed' THEN NEW.created_at ELSE NULL END
  )
  ON CONFLICT (subscription_id) DO UPDATE SET
    total_payments = COALESCE(subscription_analytics.total_payments, 0) + COALESCE(NEW.amount, 0),
    successful_payments = subscription_analytics.successful_payments + 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failed_payments = subscription_analytics.failed_payments + 
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    average_payment_amount = (
      COALESCE(subscription_analytics.average_payment_amount, 0) * 
      COALESCE(subscription_analytics.successful_payments + subscription_analytics.failed_payments, 0) + 
      COALESCE(NEW.amount, 0)
    ) / NULLIF(
      COALESCE(subscription_analytics.successful_payments + subscription_analytics.failed_payments, 0) + 1, 
      0
    ),
    last_payment_date = CASE 
      WHEN NEW.status = 'completed' THEN NEW.created_at 
      ELSE subscription_analytics.last_payment_date 
    END,
    updated_at = now();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details
    RAISE WARNING 'Error in update_payment_analytics: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    -- Create error notification
    INSERT INTO notifications (
      title,
      message,
      type
    ) VALUES (
      'Payment Analytics Error',
      format('Error processing payment %s: %s', NEW.id, SQLERRM),
      'error'
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER update_payment_analytics_trigger
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_analytics();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_updated_at 
  ON subscription_analytics(updated_at);