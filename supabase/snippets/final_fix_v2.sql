-- SOLUÇÃO DEFINITIVA PARA EXCLUSÃO (CASCATA)
-- O problema: Quando você apaga um Grupo, o banco tenta apagar as Partidas -> que tenta apagar Participantes/Votos.
-- Se você não tiver permissão para apagar os Participantes (de outras pessoas), a operação inteira falha.

-- 1. Permite apagar VOTOS (Se você for Admin do Grupo da partida)
create policy "Enable delete for group admins" on public.match_votes
for delete using (
  exists (
    select 1 from public.matches m
    join public.group_members gm on m.group_id = gm.group_id
    where m.id = match_votes.match_id
    and gm.user_id = auth.uid()
    and gm.role in ('admin', 'owner')
  )
);

-- 2. Permite apagar PARTICIPANTES (Se você for Admin do Grupo)
-- Remove a política antiga restritiva se existir, ou cria uma nova complementar (Postgres permite várias, OR logic)
-- Vamos criar uma nova que adiciona permissão para admins.
create policy "Enable delete for group admins" on public.match_participants
for delete using (
  exists (
    select 1 from public.matches m
    join public.group_members gm on m.group_id = gm.group_id
    where m.id = match_participants.match_id
    and gm.user_id = auth.uid()
    and gm.role in ('admin', 'owner')
  )
);

-- 3. TRANSACÕES (Garantir que Admin pode apagar)
drop policy if exists "Enable update/delete access for authenticated users" on public.transactions;
create policy "Enable delete for group admins" on public.transactions
for delete using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = transactions.group_id and role in ('admin', 'owner')
  )
);
create policy "Enable update for group admins" on public.transactions
for update using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = transactions.group_id and role in ('admin', 'owner')
  )
);
-- Restaurar insert/select se necessário, mas 'authenticated' create policy usually handles insert.

-- 4. REFORÇAR GRUPOS E PARTIDAS (Caso o passo anterior tenha falhado)
drop policy if exists "Enable delete for group admins" on public.groups;
create policy "Enable delete for group admins" on public.groups
for delete using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = id and role in ('admin', 'owner')
  )
);

drop policy if exists "Enable delete for group admins" on public.matches;
create policy "Enable delete for group admins" on public.matches
for delete using (
  auth.uid() in (
    select user_id from public.group_members 
    where group_id = group_id and role in ('admin', 'owner')
  )
);
