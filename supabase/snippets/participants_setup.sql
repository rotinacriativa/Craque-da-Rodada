-- Create match_participants table
create table if not exists public.match_participants (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, -- or public.profiles(id) if preferred
  status text check (status in ('confirmed', 'waitlist', 'declined')) default 'confirmed',
  team text check (team in ('A', 'B')), -- To store generated team result
  created_at timestamptz default now(),
  unique(match_id, user_id) -- Prevent duplicate joying
);

-- RLS Policies
alter table public.match_participants enable row level security;

-- Everyone can read
create policy "Enable read access for all users" on public.match_participants for select using (true);

-- Authenticated users can insert (Join)
create policy "Enable insert access for authenticated users" on public.match_participants for insert with check (auth.role() = 'authenticated');

-- Users can update their own status (or admins)
create policy "Enable update for users based on user_id" on public.match_participants for update using (auth.uid() = user_id);

-- Admins (or group owners) should be able to update anyone (e.g. assigning teams), but current RLS is simple. 
-- For now, let's allow update if you are the user OR if you are authenticated (to simplify admin actions for MVP). 
-- ideally limit to group admins.
create policy "Enable update for authenticated users" on public.match_participants for update using (auth.role() = 'authenticated');

-- Allow delete (Leave match)
create policy "Enable delete for users based on user_id" on public.match_participants for delete using (auth.uid() = user_id);
