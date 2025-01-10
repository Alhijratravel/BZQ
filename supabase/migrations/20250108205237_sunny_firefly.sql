/*
  # Add end_date column to subscriptions
  
  1. Changes
    - Add end_date column to subscriptions table
    - Add check constraint for end_date
*/

-- Add end_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' 
    AND column_name = 'end_date'
  ) THEN
    ALTER TABLE subscriptions 
    ADD COLUMN end_date date;
  END IF;
END $$;

-- Add check constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_end_date_check'
  ) THEN
    ALTER TABLE subscriptions 
    ADD CONSTRAINT subscriptions_end_date_check 
    CHECK (end_date IS NULL OR end_date > start_date);
  END IF;
END $$;