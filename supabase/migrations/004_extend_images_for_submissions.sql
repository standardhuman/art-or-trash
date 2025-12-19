-- Add submission-related columns to images
ALTER TABLE images ADD COLUMN IF NOT EXISTS submitter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE images ADD COLUMN IF NOT EXISTS submitter_prediction TEXT CHECK (submitter_prediction IN ('art', 'trash'));
ALTER TABLE images ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT false;
ALTER TABLE images ADD COLUMN IF NOT EXISTS graduation_date TIMESTAMPTZ;
ALTER TABLE images ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE images ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

-- Update existing images to be graduated (seeded content)
UPDATE images SET is_graduated = true, graduation_date = created_at WHERE is_graduated IS NULL OR is_graduated = false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_images_submitter ON images(submitter_id);
CREATE INDEX IF NOT EXISTS idx_images_graduated ON images(is_graduated);
CREATE INDEX IF NOT EXISTS idx_images_flagged ON images(is_flagged);
