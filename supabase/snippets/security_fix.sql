-- SECURITY FIX: Harden RLS Policies
-- Execute this to restrict write access to Group Admins only.

-- 1. GROUPS TABLE
-- Remove permissive policy
drop policy if exists "Enable update access for authenticated users" on public.groups;
-- Add strict policy
create policy "Enable update for group admins" on public.groups 
for update using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = id and role in ('admin', 'owner')
  )
);

-- 2. MATCHES TABLE
-- Remove permissive policies
drop policy if exists "Enable insert access for authenticated users" on public.matches;
drop policy if exists "Enable update access for authenticated users" on public.matches;

-- Add strict policies
create policy "Enable insert for group admins" on public.matches 
for insert with check (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = group_id and role in ('admin', 'owner')
  )
);

create policy "Enable update for group admins" on public.matches 
for update using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = group_id and role in ('admin', 'owner')
  )
);

-- 3. GROUP MEMBERS TABLE
-- Remove permissive policy
drop policy if exists "Enable update access for authenticated users" on public.group_members;

-- Add strict policy (Only admins can update other members, e.g. approve/ban)
create policy "Enable update for group admins" on public.group_members
for update using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = group_id and role in ('admin', 'owner')
  )
);
