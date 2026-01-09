-- Ensure all foreign keys to auth.users cascade deletion

-- 1. Profiles (id -> auth.users.id)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. Groups (created_by -> auth.users.id)
-- Note: 'created_by' might not be a formal FK yet, or named differently.
-- We'll try to drop common names or just add it.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'created_by') THEN
    ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS groups_created_by_fkey;
    ALTER TABLE public.groups
    ADD CONSTRAINT groups_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Group Members (user_id -> auth.users.id)
ALTER TABLE public.group_members
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey,
ADD CONSTRAINT group_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Match Participants (user_id -> auth.users.id)
ALTER TABLE public.match_participants
DROP CONSTRAINT IF EXISTS match_participants_user_id_fkey,
ADD CONSTRAINT match_participants_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 5. Match Votes (voter_id, voted_user_id -> auth.users.id)
ALTER TABLE public.match_votes
DROP CONSTRAINT IF EXISTS match_votes_voter_id_fkey;
ALTER TABLE public.match_votes
ADD CONSTRAINT match_votes_voter_id_fkey
FOREIGN KEY (voter_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.match_votes
DROP CONSTRAINT IF EXISTS match_votes_voted_user_id_fkey;
ALTER TABLE public.match_votes
ADD CONSTRAINT match_votes_voted_user_id_fkey
FOREIGN KEY (voted_user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 6. Transactions (created_by -> auth.users.id)
-- Note: transactions might have 'user_id' too in some schemas, strictly created_by in setup.
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_created_by_fkey,
ADD CONSTRAINT transactions_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 7. Wallets? (If implied by finance) - Assuming no wallets table yet based on file list.

-- 8. Storage Objects (Clean up via backend app logic, or triggers - opting for Trigger for robustness)
-- Actually, deleting storage objects via trigger is hard because access to 'storage.objects' from 'public' trigger might be restricted or require security definer.
-- The Service Role API delete is easier to implement in the App.
