-- Create groups table
create table if not exists public.groups (
  id text primary key, -- Allowing text to match existing URL parameters like '1'
  name text not null,
  description text,
  location text,
  image_url text,
  created_at timestamptz default now()
);

-- Create matches table
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  group_id text references public.groups(id) on delete cascade,
  name text not null,
  date date not null,
  day_of_week text,
  start_time time not null,
  end_time time not null,
  location text,
  latitude float,
  longitude float,
  capacity int,
  price numeric,
  gender text,
  recurring boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.groups enable row level security;
alter table public.matches enable row level security;

create policy "Enable read access for all users" on public.groups for select using (true);
create policy "Enable insert access for authenticated users" on public.groups for insert with check (auth.role() = 'authenticated');
create policy "Enable update access for authenticated users" on public.groups for update using (auth.role() = 'authenticated');

create policy "Enable read access for all users" on public.matches for select using (true);
create policy "Enable insert access for authenticated users" on public.matches for insert with check (auth.role() = 'authenticated');
create policy "Enable update access for authenticated users" on public.matches for update using (auth.role() = 'authenticated');

-- Insert a demo group to ensure the ID '1' works (if used in URL)
insert into public.groups (id, name, description, location)
values ('1', 'Os Boleiros de Terça', 'Futebol de terça-feira à noite na Arena Power.', 'São Paulo, SP')
on conflict (id) do nothing;
