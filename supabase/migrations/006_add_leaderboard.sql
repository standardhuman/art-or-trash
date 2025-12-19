-- Create leaderboard snapshots table
CREATE TABLE IF NOT EXISTS leaderboard_weeks (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(week_start)
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id SERIAL PRIMARY KEY,
    week_id INTEGER REFERENCES leaderboard_weeks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    score NUMERIC(10, 4) NOT NULL, -- accuracy * sqrt(volume)
    votes_cast INTEGER NOT NULL,
    correct_predictions INTEGER NOT NULL,
    accuracy NUMERIC(5, 4) NOT NULL,
    UNIQUE(week_id, user_id)
);

-- Enable RLS
ALTER TABLE leaderboard_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Leaderboards are public" ON leaderboard_weeks FOR SELECT USING (true);
CREATE POLICY "Leaderboard entries are public" ON leaderboard_entries FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_week ON leaderboard_entries(week_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(week_id, rank);
