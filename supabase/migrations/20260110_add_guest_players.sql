-- Allow NULL user_id for guest players
ALTER TABLE match_participants ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_name column
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS guest_name TEXT;

-- Add guest_position column (optional, for sorting)
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS guest_position TEXT;

-- Add guest_skill_level column (optional, for sorting)
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS guest_skill_level NUMERIC;

-- Constraint: user_id OR guest_name must be present (not both null) -> enforcing this logic in app or trigger, but check constraint is good
ALTER TABLE match_participants ADD CONSTRAINT user_or_guest_check CHECK (
    (user_id IS NOT NULL) OR (guest_name IS NOT NULL)
);
