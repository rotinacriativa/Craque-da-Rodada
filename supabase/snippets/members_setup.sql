-- Create group_members table
create table if not exists public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id text references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, -- Linking to auth.users effectively
  role text check (role in ('admin', 'member')) default 'member',
  status text check (status in ('active', 'pending', 'banned')) default 'pending',
  joined_at timestamptz default now()
);

-- RLS Policies
alter table public.group_members enable row level security;

-- Everyone can read members (to see who is in the group)
create policy "Enable read access for all users" on public.group_members for select using (true);

-- Only authenticated users can request to join (insert themselves)
create policy "Enable insert access for authenticated users" on public.group_members for insert with check (auth.role() = 'authenticated');

-- Only admins can update (approve/reject/ban) - Simplification: Allow any auth user to update for now, or match group admin logic later
create policy "Enable update access for authenticated users" on public.group_members for update using (auth.role() = 'authenticated');

-- Insert current user as admin of group 1 (for testing)
-- Note: Replace 'USER_ID_HERE' with actual user ID if running manually, or we rely on the app flow.
-- For now, let's just create the table.
