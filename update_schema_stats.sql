-- Add statistics columns to match_participants
alter table public.match_participants 
add column if not exists goals int default 0,
add column if not exists assists int default 0,
add column if not exists rating numeric(3,1); -- e.g. 8.5

-- Add winner_team to matches
alter table public.matches
add column if not exists winner_team text check (winner_team in ('A', 'B', 'Draw'));

-- Create or Replace the Ranking Function
create or replace function get_player_ranking(
  p_group_id text default null,
  p_start_date date default null,
  p_end_date date default null
)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  position text,
  matches_played bigint,
  goals bigint,
  assists bigint,
  wins bigint,
  avg_rating numeric,
  total_score numeric
) 
language plpgsql
security definer
as $$
begin
  return query
  select 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.position,
    count(mp.match_id) as matches_played,
    sum(coaleasce(mp.goals, 0)) as goals,
    sum(coaleasce(mp.assists, 0)) as assists,
    count(case when m.winner_team = mp.team then 1 end) as wins,
    round(avg(mp.rating), 1) as avg_rating,
    -- Custom score calculation (customize as needed)
    (sum(coalesce(mp.goals, 0)) * 3 + sum(coalesce(mp.assists, 0)) * 2 + count(case when m.winner_team = mp.team then 1 end) * 2) as total_score
  from 
    public.match_participants mp
  join 
    public.matches m on mp.match_id = m.id
  join 
    public.profiles p on mp.user_id = p.id
  where 
    mp.status = 'confirmed'
    and (p_group_id is null or m.group_id = p_group_id)
    and (p_start_date is null or m.date >= p_start_date)
    and (p_end_date is null or m.date <= p_end_date)
  group by 
    p.id, p.full_name, p.avatar_url, p.position
  having 
    count(mp.match_id) > 0;
end;
$$;
