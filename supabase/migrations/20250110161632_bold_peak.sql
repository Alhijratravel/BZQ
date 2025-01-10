-- Create family_member_rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS family_member_rules (
  id text PRIMARY KEY DEFAULT 'RUL-' || substr(gen_random_uuid()::text, 1, 8),
  addon_age integer NOT NULL DEFAULT 18,
  transition_age integer NOT NULL DEFAULT 23,
  addon_fee numeric NOT NULL DEFAULT 0,
  auto_transition boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create family_member_transitions table if it doesn't exist
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

-- Add new columns to family_members table
ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'addon', 'pending_transition', 'transitioned')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS transition_date date,
ADD COLUMN IF NOT EXISTS addon_fee numeric;

-- Enable RLS
ALTER TABLE family_member_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_transitions ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies with unique names
CREATE POLICY "family_member_rules_read_policy"
  ON family_member_rules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "family_member_transitions_read_policy"
  ON family_member_transitions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.id = family_member_transitions.family_member_id
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_family_members_status ON family_members(status);
CREATE INDEX IF NOT EXISTS idx_family_members_transition_date ON family_members(transition_date);
CREATE INDEX IF NOT EXISTS idx_family_member_transitions_processed ON family_member_transitions(processed);

-- Insert default rules if not exists
INSERT INTO family_member_rules (
  addon_age,
  transition_age,
  addon_fee,
  auto_transition
)
SELECT 18, 23, 9.99, true
WHERE NOT EXISTS (SELECT 1 FROM family_member_rules);