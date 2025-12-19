-- Add confidence column to votes
ALTER TABLE votes ADD COLUMN IF NOT EXISTS confidence TEXT DEFAULT 'normal'
    CHECK (confidence IN ('normal', 'confident'));

-- Add user_id column (nullable for anonymous votes)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add index for user votes
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
