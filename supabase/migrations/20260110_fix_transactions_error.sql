-- Adiciona a coluna payment_method se ela não existir
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'outros';

-- Recarrega o cache do Supabase para reconhecer a nova coluna imediatamente
NOTIFY pgrst, 'reload config';
