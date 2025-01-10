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
  updated_at timestamptz DEFAULT now()
);

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_subscription_analytics_subscription_id;

-- Create new unique index
CREATE UNIQUE INDEX idx_subscription_analytics_subscription_id 
ON subscription_analytics(subscription_id);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscription_analytics_subscription_id_key'
  ) THEN
    ALTER TABLE subscription_analytics 
    ADD CONSTRAINT subscription_analytics_subscription_id_key 
    UNIQUE (subscription_id);
  END IF;
END $$;