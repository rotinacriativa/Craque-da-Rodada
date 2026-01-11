-- Helper function to increment stats safely in Postgres via RPC
create or replace function increment_participant_stat(
  p_id uuid,
  p_col text
)
returns void
language plpgsql
security definer
as $$
begin
  execute format('update public.match_participants set %I = coalesce(%I, 0) + 1 where id = %L', p_col, p_col, p_id);
end;
$$;
