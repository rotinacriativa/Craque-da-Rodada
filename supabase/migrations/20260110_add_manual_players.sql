ALTER TABLE group_members ADD COLUMN is_manual BOOLEAN DEFAULT FALSE;
ALTER TABLE group_members ADD COLUMN manual_name TEXT;
ALTER TABLE group_members ADD COLUMN manual_position TEXT;
ALTER TABLE group_members ADD COLUMN manual_skill_level TEXT;
ALTER TABLE group_members ADD COLUMN manual_notes TEXT;

-- Make user_id nullable to support manual players without auth account
ALTER TABLE group_members ALTER COLUMN user_id DROP NOT NULL;
