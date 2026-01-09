-- FIX: Corrected RLS Policies for Group and Match Deletion
-- This script fixes the ambiguity and logic errors in existing delete policies.

-- 1. Correct Policy for public.groups Deletion
DROP POLICY IF EXISTS "Enable delete for group admins" ON public.groups;
CREATE POLICY "Enable delete for group admins" ON public.groups
FOR DELETE USING (
  auth.uid() IN (
    SELECT user_id FROM public.group_members 
    WHERE group_members.group_id = groups.id AND group_members.role IN ('admin', 'owner')
  )
);

-- 2. Correct Policy for public.matches Deletion
DROP POLICY IF EXISTS "Enable delete for group admins" ON public.matches;
CREATE POLICY "Enable delete for group admins" ON public.matches
FOR DELETE USING (
  auth.uid() IN (
    SELECT user_id FROM public.group_members 
    WHERE group_members.group_id = matches.group_id AND group_members.role IN ('admin', 'owner')
  )
);

-- 3. Ensure other related tables have cascading-safe policies if needed
-- (Assuming cascading handles most of it, but RLS on child tables can sometimes block client-side deletes)
DROP POLICY IF EXISTS "Enable delete for group admins on match_participants" ON public.match_participants;
CREATE POLICY "Enable delete for group admins on match_participants" ON public.match_participants
FOR DELETE USING (
  auth.uid() IN (
    SELECT gm.user_id FROM public.group_members gm
    JOIN public.matches m ON m.group_id = gm.group_id
    WHERE m.id = match_participants.match_id AND gm.role IN ('admin', 'owner')
  )
);
