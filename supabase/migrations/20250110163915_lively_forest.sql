/*
  # Add Webhook Support

  1. New Tables
    - `webhooks`
      - `id` (text, primary key)
      - `url` (text, required)
      - `event` (text, required)
      - `description` (text)
      - `secret` (text, required)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `webhook_deliveries`
      - `id` (text, primary key)
      - `webhook_id` (text, references webhooks)
      - `event` (text)
      - `payload` (jsonb)
      - `response_status` (integer)
      - `response_body` (text)
      - `error` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    
  3. Indexes
    - Index on webhook event type
    - Index on webhook delivery status
    - Index on webhook delivery created_at
*/

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id text PRIMARY KEY DEFAULT 'WHK-' || substr(gen_random_uuid()::text, 1, 8),
  url text NOT NULL CHECK (char_length(url) >= 1 AND char_length(url) <= 2048),
  event text NOT NULL CHECK (event IN (
    'payment.completed',
    'payment.failed',
    'subscription.created',
    'subscription.updated',
    'subscription.cancelled',
    'customer.created',
    'customer.updated'
  )),
  description text,
  secret text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create webhook_deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id text PRIMARY KEY DEFAULT 'WHD-' || substr(gen_random_uuid()::text, 1, 8),
  webhook_id text REFERENCES webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read webhooks"
  ON webhooks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert webhooks"
  ON webhooks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update webhooks"
  ON webhooks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete webhooks"
  ON webhooks FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read webhook_deliveries"
  ON webhook_deliveries FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM webhooks w
    WHERE w.id = webhook_deliveries.webhook_id
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_event ON webhooks(event);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_response_status ON webhook_deliveries(response_status);

-- Create updated_at trigger for webhooks
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to log webhook delivery
CREATE OR REPLACE FUNCTION log_webhook_delivery(
  p_webhook_id text,
  p_event text,
  p_payload jsonb,
  p_response_status integer DEFAULT NULL,
  p_response_body text DEFAULT NULL,
  p_error text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO webhook_deliveries (
    webhook_id,
    event,
    payload,
    response_status,
    response_body,
    error
  ) VALUES (
    p_webhook_id,
    p_event,
    p_payload,
    p_response_status,
    p_response_body,
    p_error
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old webhook deliveries
CREATE OR REPLACE FUNCTION cleanup_webhook_deliveries()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_deliveries
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;