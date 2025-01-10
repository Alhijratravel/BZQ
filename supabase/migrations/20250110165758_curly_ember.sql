/*
  # Add Subscription Analytics Index

  1. Changes
    - Add unique index on subscription_id column of subscription_analytics table
    - Drop existing index if it exists to avoid conflicts
    - Ensure proper constraint naming

  2. Purpose
    - Improve query performance for subscription analytics lookups
    - Enforce uniqueness of subscription_id
*/

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