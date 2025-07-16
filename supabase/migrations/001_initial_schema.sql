-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('art', 'trash')),
    title TEXT,
    artist TEXT,
    museum TEXT,
    total_votes INTEGER DEFAULT 0,
    correct_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('art', 'trash')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_images_type ON images(type);
CREATE INDEX idx_images_total_votes ON images(total_votes DESC);
CREATE INDEX idx_votes_image_id ON votes(image_id);

-- Create view for image statistics
CREATE OR REPLACE VIEW image_stats AS
SELECT 
    i.id,
    i.url,
    i.type,
    i.title,
    i.artist,
    i.museum,
    i.total_votes,
    i.correct_votes,
    CASE 
        WHEN i.total_votes > 0 
        THEN ROUND((i.correct_votes::FLOAT / i.total_votes) * 100, 2)
        ELSE 0
    END as accuracy_percentage
FROM images i
ORDER BY i.total_votes DESC;

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Images are viewable by everyone" ON images
    FOR SELECT USING (true);

CREATE POLICY "Anyone can submit images" ON images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can vote" ON votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);