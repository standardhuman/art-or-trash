-- Add accuracy tracking columns to images table
ALTER TABLE images ADD COLUMN total_votes INTEGER DEFAULT 0;
ALTER TABLE images ADD COLUMN correct_votes INTEGER DEFAULT 0;

-- Create view for image statistics
CREATE VIEW IF NOT EXISTS image_stats AS
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
        THEN ROUND(CAST(i.correct_votes AS FLOAT) / i.total_votes * 100, 2)
        ELSE 0
    END as accuracy_percentage
FROM images i
ORDER BY i.total_votes DESC;

-- Update existing vote counts from votes table
UPDATE images 
SET total_votes = (
    SELECT COUNT(*) 
    FROM votes 
    WHERE votes.image_id = images.id
),
correct_votes = (
    SELECT COUNT(*) 
    FROM votes 
    WHERE votes.image_id = images.id 
    AND ((images.type = 'art' AND votes.vote = 'art') 
         OR (images.type = 'trash' AND votes.vote = 'trash'))
);