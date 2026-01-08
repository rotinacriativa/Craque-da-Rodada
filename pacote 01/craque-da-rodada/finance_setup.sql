-- Create transactions table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  group_id text references public.groups(id) on delete cascade,
  description text not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')) not null,
  category text, -- 'match_fee', 'monthly_fee', 'court_rental', 'equipment', 'other'
  date date default CURRENT_DATE,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Fix date default to use CURRENT_DATE
alter table public.transactions alter column date set default CURRENT_DATE;

-- RLS Policies
alter table public.transactions enable row level security;

-- Everyone in the group (or just admins?) can read transactions.
-- For now, allow authenticated read for simplicity, or match group membership logic later.
create policy "Enable read access for authenticated users" on public.transactions for select using (auth.role() = 'authenticated');

-- Only authenticated users can insert (usually admins)
create policy "Enable insert access for authenticated users" on public.transactions for insert with check (auth.role() = 'authenticated');

-- Only authenticated users can update/delete
create policy "Enable update/delete access for authenticated users" on public.transactions for all using (auth.role() = 'authenticated');
