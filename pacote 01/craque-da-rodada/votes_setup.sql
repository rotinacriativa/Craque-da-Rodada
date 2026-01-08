-- Create match_votes table
create table if not exists public.match_votes (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade,
  voter_id uuid references auth.users(id) on delete cascade, 
  voted_user_id uuid references auth.users(id) on delete cascade,
  category text check (category in ('craque', 'bagre')) default 'craque',
  created_at timestamptz default now(),
  unique(match_id, voter_id, category) -- One vote per category per match per user
);

-- RLS Policies
alter table public.match_votes enable row level security;

-- Everyone can read (to see results)
create policy "Enable read access for all users" on public.match_votes for select using (true);

-- Authenticated users (participants) can insert
create policy "Enable insert access for authenticated users" on public.match_votes for insert with check (auth.role() = 'authenticated');

-- Users can change their vote? (Update own vote)
create policy "Enable update for users based on voter_id" on public.match_votes for update using (auth.uid() = voter_id);
