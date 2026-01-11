-- Migration to support detailed match history and events
-- 1. Add final score columns to matches
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='score_a') THEN
        ALTER TABLE public.matches ADD COLUMN score_a INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='score_b') THEN
        ALTER TABLE public.matches ADD COLUMN score_b INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='mvp_id') THEN
        ALTER TABLE public.matches ADD COLUMN mvp_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. Create match_events table
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.match_participants(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('goal', 'card_yellow', 'card_red', 'foul')),
    team CHAR(1) NOT NULL CHECK (team IN ('A', 'B', 'C', 'D')),
    event_time TEXT, -- e.g. "12:30"
    assist_id UUID REFERENCES public.match_participants(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Anyone in the group can view match events" ON public.match_events;
CREATE POLICY "Anyone in the group can view match events"
ON public.match_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.matches m
        JOIN public.group_members gm ON m.group_id = gm.group_id
        WHERE m.id = public.match_events.match_id
        AND gm.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins can insert match events" ON public.match_events;
CREATE POLICY "Admins can insert match events"
ON public.match_events
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.matches m
        JOIN public.group_members gm ON m.group_id = gm.group_id
        WHERE m.id = public.match_events.match_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

DROP POLICY IF EXISTS "Admins can delete match events" ON public.match_events;
CREATE POLICY "Admins can delete match events"
ON public.match_events
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.matches m
        JOIN public.group_members gm ON m.group_id = gm.group_id
        WHERE m.id = public.match_events.match_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);
