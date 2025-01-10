-- Create subscription_analytics table first
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

-- Add unique index for subscription_id
CREATE UNIQUE INDEX idx_subscription_analytics_subscription_id 
ON subscription_analytics(subscription_id);

-- Enable RLS
ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can read subscription analytics" ON subscription_analytics;

-- Create RLS policy
CREATE POLICY "Authenticated users can read subscription analytics"
  ON subscription_analytics FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.id = subscription_analytics.subscription_id
  ));

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

-- Create sample plans
INSERT INTO plans (id, name, description, price, billing_cycle, max_family_members, features, active)
VALUES
  (
    'PLN-' || substr(gen_random_uuid()::text, 1, 8),
    'Basic Family Plan',
    'Perfect for small families',
    29.99,
    'monthly',
    4,
    ARRAY['Up to 4 family members', 'Basic features', '24/7 support'],
    true
  ),
  (
    'PLN-' || substr(gen_random_uuid()::text, 1, 8),
    'Premium Family Plan',
    'Ideal for larger families',
    49.99,
    'monthly',
    8,
    ARRAY['Up to 8 family members', 'Premium features', 'Priority support', 'Advanced analytics'],
    true
  );

-- Create sample customer
INSERT INTO customers (id, first_name, last_name, email, type, status)
VALUES (
  'CUS-' || substr(gen_random_uuid()::text, 1, 8),
  'John',
  'Doe',
  'john.doe@example.com',
  'family',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Create sample subscription
WITH new_customer AS (
  SELECT id, email FROM customers WHERE email = 'john.doe@example.com'
),
new_plan AS (
  SELECT id FROM plans WHERE name = 'Basic Family Plan' LIMIT 1
)
INSERT INTO subscriptions (
  id,
  customer_id,
  plan_id,
  start_date,
  billing_cycle,
  status,
  auto_renew
)
SELECT
  'SUB-' || substr(gen_random_uuid()::text, 1, 8),
  new_customer.id,
  new_plan.id,
  CURRENT_DATE,
  'monthly',
  'active',
  true
FROM new_customer, new_plan
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions s
  WHERE s.customer_id = new_customer.id
);

-- Create sample payment
WITH active_subscription AS (
  SELECT s.id as subscription_id, s.customer_id, p.price
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  JOIN customers c ON s.customer_id = c.id
  WHERE c.email = 'john.doe@example.com'
  LIMIT 1
)
INSERT INTO payments (
  id,
  subscription_id,
  customer_id,
  amount,
  status,
  payment_method
)
SELECT
  'PAY-' || substr(gen_random_uuid()::text, 1, 8),
  subscription_id,
  customer_id,
  price,
  'completed',
  'sepa'
FROM active_subscription
WHERE NOT EXISTS (
  SELECT 1 FROM payments p
  WHERE p.subscription_id = active_subscription.subscription_id
);

-- Create sample analytics event
WITH active_subscription AS (
  SELECT s.id as subscription_id, s.customer_id
  FROM subscriptions s
  JOIN customers c ON s.customer_id = c.id
  WHERE c.email = 'john.doe@example.com'
  LIMIT 1
)
INSERT INTO analytics_events (
  id,
  event_type,
  customer_id,
  subscription_id,
  metadata
)
SELECT
  'EVT-' || substr(gen_random_uuid()::text, 1, 8),
  'subscription_created',
  customer_id,
  subscription_id,
  '{}'::jsonb
FROM active_subscription
WHERE NOT EXISTS (
  SELECT 1 FROM analytics_events e
  WHERE e.subscription_id = active_subscription.subscription_id
);