-- Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    payment_method TEXT DEFAULT 'outros',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add PIX columns to Groups table if they don't exist
ALTER TABLE groups ADD COLUMN IF NOT EXISTS pix_key TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS pix_key_type TEXT DEFAULT 'email';

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Transactions
-- Admins can view and manage all transactions for their groups
CREATE POLICY "Admins can manage transactions" ON transactions
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members 
            WHERE group_id = transactions.group_id AND role = 'admin'
        )
    );

-- Members can view transactions (transparency)
CREATE POLICY "Members can view transactions" ON transactions
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members 
            WHERE group_id = transactions.group_id
        )
    );
