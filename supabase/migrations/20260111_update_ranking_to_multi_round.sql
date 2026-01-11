-- Migration to add session-based stats to participants
-- This allows tracking multiple rounds within a single pelada event

alter table public.match_participants 
add column if not exists wins int default 0,
add column if not exists draws int default 0;

-- Update the ranking function to use these participant-level stats instead of a single match winner
create or replace function get_player_ranking(
  p_group_id uuid default null,
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
    sum(coalesce(mp.goals, 0))::bigint as goals,
    sum(coalesce(mp.assists, 0))::bigint as assists,
    sum(coalesce(mp.wins, 0))::bigint as wins,
    coalesce(round(avg(mp.rating), 1), 0) as avg_rating,
    -- Calculation: Vitória=5, Empate=2, Gol=3, Assist=2
    (
      sum(coalesce(mp.wins, 0)) * 5 + 
      sum(coalesce(mp.draws, 0)) * 2 +
      sum(coalesce(mp.goals, 0)) * 3 + 
      sum(coalesce(mp.assists, 0)) * 2
    )::numeric as total_score
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
