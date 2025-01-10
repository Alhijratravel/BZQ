-- Create subscription_analytics table
CREATE TABLE IF NOT EXISTS subscription_analytics (
  id text PRIMARY KEY DEFAULT 'SAN-' || substr(gen_random_uuid()::text, 1, 8),
  subscription_id text REFERENCES subscriptions(id) ON DELETE CASCADE UNIQUE,
  total_payments numeric DEFAULT 0,
  successful_payments integer DEFAULT 0,
  failed_payments integer DEFAULT 0,
  average_payment_amount numeric DEFAULT 0,
  last_payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read subscription analytics"
  ON subscription_analytics FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.id = subscription_analytics.subscription_id
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_subscription_id 
  ON subscription_analytics(subscription_id);

-- Create trigger function for payment analytics
CREATE OR REPLACE FUNCTION update_payment_analytics()
RETURNS TRIGGER AS $$
BEGIN
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
    NEW.amount,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    NEW.amount,
    CASE WHEN NEW.status = 'completed' THEN NEW.created_at ELSE NULL END
  )
  ON CONFLICT (subscription_id) DO UPDATE SET
    total_payments = subscription_analytics.total_payments + NEW.amount,
    successful_payments = subscription_analytics.successful_payments + 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failed_payments = subscription_analytics.failed_payments + 
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    average_payment_amount = (subscription_analytics.average_payment_amount * 
      (subscription_analytics.successful_payments + subscription_analytics.failed_payments) + 
      NEW.amount) / NULLIF(subscription_analytics.successful_payments + 
      subscription_analytics.failed_payments + 1, 0),
    last_payment_date = CASE 
      WHEN NEW.status = 'completed' THEN NEW.created_at 
      ELSE subscription_analytics.last_payment_date 
    END,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_payment_analytics_trigger ON payments;
CREATE TRIGGER update_payment_analytics_trigger
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_analytics();