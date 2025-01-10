/*
  # Add customer_id to family_members table

  1. Changes
    - Add customer_id column to family_members table
    - Add foreign key constraint to customers table
    - Remove subscription_id column as we're linking directly to customers
*/

-- Remove subscription_id column and add customer_id
ALTER TABLE family_members 
  DROP COLUMN IF EXISTS subscription_id,
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_family_members_customer_id ON family_members(customer_id);