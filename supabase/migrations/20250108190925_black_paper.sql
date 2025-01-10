/*
  # Add customer type and family members support

  1. Changes
    - Add type column to customers table
    - Create family_members table linked to customers
  
  2. Security
    - Enable RLS on family_members table
    - Add policies for authenticated users (if they don't exist)
*/

-- Add type column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'single';

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth date NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'family_members' 
    AND policyname = 'Authenticated users can read family_members'
  ) THEN
    CREATE POLICY "Authenticated users can read family_members"
      ON family_members
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'family_members' 
    AND policyname = 'Authenticated users can insert family_members'
  ) THEN
    CREATE POLICY "Authenticated users can insert family_members"
      ON family_members
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'family_members' 
    AND policyname = 'Authenticated users can update family_members'
  ) THEN
    CREATE POLICY "Authenticated users can update family_members"
      ON family_members
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'family_members' 
    AND policyname = 'Authenticated users can delete family_members'
  ) THEN
    CREATE POLICY "Authenticated users can delete family_members"
      ON family_members
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Add trigger for updated_at (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_family_members_updated_at'
  ) THEN
    CREATE TRIGGER update_family_members_updated_at
      BEFORE UPDATE ON family_members
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;