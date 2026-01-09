-- FIX: Enable Deletion for Groups and Matches
-- Currently, RLS policies prevent deletion of these resources.

-- 1. GROUPS Deletion
-- Allow users to delete groups if they are the 'created_by' owner? 
-- Or simpler: Allow deletion if they are an admin/owner in group_members.
-- Since we are cascading, we need to be careful. Ideally only the OWNER should delete the group.
-- But 'groups' table might not have 'created_by' column in the setup I saw earlier (it had id, name, description...).
-- Let's check columns... id, name, description, location, image_url, created_at. NO OWNER_ID column?
-- Wait, if there is no owner column on groups table, we rely on group_members.
-- Let's assume if you are 'owner' or 'admin' in group_members, you can delete.

create policy "Enable delete for group admins" on public.groups
for delete using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = id and role in ('admin', 'owner')
  )
);

-- 2. MATCHES Deletion
-- Only group admins can delete matches
create policy "Enable delete for group admins" on public.matches
for delete using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = group_id and role in ('admin', 'owner')
  )
);

-- 3. ENSURE other tables have delete policies if not already active (Cascading usually bypasses RLS if done by DB engine, 
-- but if we delete manually from client, we need policies).

-- Transactions deletion (Already had all access? No, check finance_setup.sql... it had 'all using authenticated'. That is fine/permissive but works.)

