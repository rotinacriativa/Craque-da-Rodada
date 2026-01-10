-- 1. Update groups table with price defaults
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS price_mensalista NUMERIC DEFAULT 0;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS price_avulso NUMERIC DEFAULT 0;

-- 2. Update group_members table with payment types
ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('MENSALISTA', 'AVULSO', 'CONVIDADO')) DEFAULT 'AVULSO';
ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS monthly_price_override NUMERIC;

-- 3. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('MENSAL', 'PARTIDA')) NOT NULL,
    status TEXT CHECK (status IN ('PENDENTE', 'PAGO', 'ISENTO')) DEFAULT 'PENDENTE',
    reference_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);

-- RLS Policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" 
ON public.payments FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = payments.group_id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role IN ('admin', 'owner')
));

CREATE POLICY "Admins can manage payments" 
ON public.payments FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = payments.group_id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role IN ('admin', 'owner')
));

-- 4. Automation: Trigger for Match Participation
CREATE OR REPLACE FUNCTION public.handle_match_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_payment_type TEXT;
    v_match_price NUMERIC;
    v_group_id TEXT;
BEGIN
    -- Get group and match info
    SELECT group_id, price INTO v_group_id, v_match_price 
    FROM public.matches WHERE id = NEW.match_id;

    -- Get member payment type
    SELECT payment_type INTO v_payment_type 
    FROM public.group_members 
    WHERE group_id = v_group_id AND user_id = NEW.user_id;

    -- Logic for charges
    IF NEW.status = 'confirmed' THEN
        IF v_payment_type = 'AVULSO' THEN
            INSERT INTO public.payments (group_id, user_id, match_id, amount, type, status, reference_date)
            VALUES (v_group_id, NEW.user_id, NEW.match_id, v_match_price, 'PARTIDA', 'PENDENTE', CURRENT_DATE)
            ON CONFLICT DO NOTHING; -- Avoid double charging if toggled
        ELSIF v_payment_type = 'CONVIDADO' THEN
            -- Guests could be free or have special price, for now use match price or 0
            -- Admin can manually adjust or we could have a 'guest_price' later
            INSERT INTO public.payments (group_id, user_id, match_id, amount, type, status, reference_date)
            VALUES (v_group_id, NEW.user_id, NEW.match_id, v_match_price, 'PARTIDA', 'PENDENTE', CURRENT_DATE)
            ON CONFLICT DO NOTHING;
        END IF;
    ELSIF NEW.status != 'confirmed' THEN
        -- If player leaves, remove the pending payment
        DELETE FROM public.payments 
        WHERE match_id = NEW.match_id AND user_id = NEW.user_id AND status = 'PENDENTE';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_participant_status_change
AFTER INSERT OR UPDATE OF status ON public.match_participants
FOR EACH ROW EXECUTE FUNCTION public.handle_match_payment();

-- 5. Monthly Payment Generator Function
CREATE OR REPLACE FUNCTION public.generate_monthly_charges(p_group_id TEXT, p_month DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.payments (group_id, user_id, amount, type, status, reference_date)
    SELECT 
        gm.group_id, 
        gm.user_id, 
        COALESCE(gm.monthly_price_override, g.price_mensalista),
        'MENSAL',
        'PENDENTE',
        p_month
    FROM public.group_members gm
    JOIN public.groups g ON g.id = gm.group_id
    WHERE gm.group_id = p_group_id 
    AND gm.payment_type = 'MENSALISTA'
    AND gm.status = 'active'
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
