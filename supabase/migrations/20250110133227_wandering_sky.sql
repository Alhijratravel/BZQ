-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read family_member_rules" ON family_member_rules;
  DROP POLICY IF EXISTS "Authenticated users can read family_member_transitions" ON family_member_transitions;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Add status field to family_members table using text type instead of enum
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'addon', 'pending_transition', 'transitioned')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS transition_date date,
ADD COLUMN IF NOT EXISTS addon_fee numeric;

-- Create family_member_rules table
CREATE TABLE IF NOT EXISTS family_member_rules (
  id text PRIMARY KEY DEFAULT 'RUL-' || substr(gen_random_uuid()::text, 1, 8),
  addon_age integer NOT NULL DEFAULT 18,
  transition_age integer NOT NULL DEFAULT 23,
  addon_fee numeric NOT NULL DEFAULT 0,
  auto_transition boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create family_member_transitions table
CREATE TABLE IF NOT EXISTS family_member_transitions (
  id text PRIMARY KEY DEFAULT 'TRN-' || substr(gen_random_uuid()::text, 1, 8),
  family_member_id text REFERENCES family_members(id) ON DELETE CASCADE,
  from_status text NOT NULL,
  to_status text NOT NULL,
  transition_date date NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status_transition CHECK (
    from_status IN ('active', 'addon', 'pending_transition', 'transitioned') AND
    to_status IN ('active', 'addon', 'pending_transition', 'transitioned')
  )
);

-- Enable RLS
ALTER TABLE family_member_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_transitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read family_member_rules"
  ON family_member_rules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read family_member_transitions"
  ON family_member_transitions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.id = family_member_transitions.family_member_id
  ));

-- Create function to calculate age
CREATE OR REPLACE FUNCTION calculate_age(birth_date date)
RETURNS integer AS $$
BEGIN
  RETURN date_part('year', age(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Create function to check and update family member status
CREATE OR REPLACE FUNCTION check_family_member_status()
RETURNS trigger AS $$
DECLARE
  member_age integer;
  rules record;
BEGIN
  -- Get current rules
  SELECT * INTO rules FROM family_member_rules LIMIT 1;
  
  IF rules IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate member age
  member_age := calculate_age(NEW.date_of_birth);
  
  -- Check age thresholds
  IF member_age >= rules.transition_age THEN
    -- Schedule for transition to independent account
    NEW.status := 'pending_transition';
    NEW.transition_date := current_date;
  ELSIF member_age >= rules.addon_age THEN
    -- Convert to addon with fee
    NEW.status := 'addon';
    NEW.addon_fee := rules.addon_fee;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for family member status updates
DROP TRIGGER IF EXISTS check_family_member_status ON family_members;
CREATE TRIGGER check_family_member_status
  BEFORE INSERT OR UPDATE OF date_of_birth ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION check_family_member_status();

-- Create function to process transitions
CREATE OR REPLACE FUNCTION process_family_member_transitions()
RETURNS void AS $$
DECLARE
  transition record;
BEGIN
  -- Get pending transitions
  FOR transition IN
    SELECT * FROM family_member_transitions
    WHERE NOT processed
    AND transition_date <= current_date
  LOOP
    -- Update family member status
    UPDATE family_members
    SET status = transition.to_status
    WHERE id = transition.family_member_id;
    
    -- Mark transition as processed
    UPDATE family_member_transitions
    SET processed = true
    WHERE id = transition.id;
    
    -- Create notification for customer
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type
    )
    SELECT
      c.id,
      CASE transition.to_status
        WHEN 'addon' THEN 'Family Member Status Change'
        WHEN 'transitioned' THEN 'Family Member Transition Required'
        ELSE 'Status Update'
      END,
      CASE transition.to_status
        WHEN 'addon' THEN 'A family member has been converted to addon status'
        WHEN 'transitioned' THEN 'A family member needs to create their own account'
        ELSE 'Family member status has been updated'
      END,
      'info'
    FROM family_members fm
    JOIN customers c ON c.id = fm.customer_id
    WHERE fm.id = transition.family_member_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default rules if not exists
INSERT INTO family_member_rules (
  addon_age,
  transition_age,
  addon_fee,
  auto_transition
)
SELECT 18, 23, 9.99, true
WHERE NOT EXISTS (SELECT 1 FROM family_member_rules);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_family_members_status ON family_members(status);
CREATE INDEX IF NOT EXISTS idx_family_members_transition_date ON family_members(transition_date);
CREATE INDEX IF NOT EXISTS idx_family_member_transitions_processed ON family_member_transitions(processed);

-- Add updated_at trigger for family_member_rules
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_family_member_rules_updated_at ON family_member_rules;
CREATE TRIGGER update_family_member_rules_updated_at
  BEFORE UPDATE ON family_member_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();