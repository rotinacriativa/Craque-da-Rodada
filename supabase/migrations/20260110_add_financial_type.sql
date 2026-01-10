
-- Migration to add financial_type to groups
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS financial_type VARCHAR(20) DEFAULT 'diarista';
-- Options: 'mensalista', 'diarista', 'convidado'

-- Ideally ensure checking constraints if possible
-- ALTER TABLE groups ADD CONSTRAINT check_financial_type CHECK (financial_type IN ('mensalista', 'diarista', 'convidado'));
