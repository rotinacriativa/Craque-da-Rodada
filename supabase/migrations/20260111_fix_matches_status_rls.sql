-- Migration to add status column to matches and fix RLS
-- This ensures we can mark matches as finished and allows admins to update them

-- 1. Add status column to matches if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='status') THEN
        ALTER TABLE public.matches ADD COLUMN status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'finished', 'cancelled'));
    END IF;
END $$;

-- 2. Ensure RLS is enabled
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing update policies if any to avoid conflicts
DROP POLICY IF EXISTS "Allow group admins to update matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can update matches in their groups" ON public.matches;

-- 4. Create a robust policy for updates
-- Admins can update matches if they are owners or admins of the group the match belongs to
CREATE POLICY "Admins can update matches in their groups" 
ON public.matches 
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = public.matches.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = public.matches.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

-- 5. Ensure SELECT is also allowed for group members
DROP POLICY IF EXISTS "Members can view matches in their groups" ON public.matches;
CREATE POLICY "Members can view matches in their groups"
ON public.matches
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = public.matches.group_id
        AND gm.user_id = auth.uid()
    )
);
