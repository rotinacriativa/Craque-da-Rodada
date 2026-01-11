-- Migration to ensure all required columns exist in match_participants
-- This fixes "column does not exist" errors if previous migrations weren't fully applied

DO $$ 
BEGIN
    -- 1. guest_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='guest_name') THEN
        ALTER TABLE match_participants ADD COLUMN guest_name TEXT;
    END IF;

    -- 2. guest_position
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='guest_position') THEN
        ALTER TABLE match_participants ADD COLUMN guest_position TEXT;
    END IF;

    -- 3. goals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='goals') THEN
        ALTER TABLE match_participants ADD COLUMN goals INT DEFAULT 0;
    END IF;

    -- 4. assists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='assists') THEN
        ALTER TABLE match_participants ADD COLUMN assists INT DEFAULT 0;
    END IF;

    -- 5. rating
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='rating') THEN
        ALTER TABLE match_participants ADD COLUMN rating NUMERIC(3,1);
    END IF;

    -- 6. wins
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='wins') THEN
        ALTER TABLE match_participants ADD COLUMN wins INT DEFAULT 0;
    END IF;

    -- 7. draws
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='draws') THEN
        ALTER TABLE match_participants ADD COLUMN draws INT DEFAULT 0;
    END IF;

    -- 8. matches.updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='updated_at') THEN
        ALTER TABLE matches ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;
