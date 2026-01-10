
-- Migration to add auto_presenca_mensalista to groups
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS auto_presenca_mensalista BOOLEAN DEFAULT false;

-- Add index if needed, but for low volume it is not strictly necessary
