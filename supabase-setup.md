# Supabase Setup Instructions

Your Supabase project ID: `yahsswggpgreawugloxi`

## Step 1: Get Your Supabase Credentials

1. Go to: https://app.supabase.com/project/yahsswggpgreawugloxi/settings/api
2. Copy these values:
   - **Project URL**: `https://yahsswggpgreawugloxi.supabase.co`
   - **Anon/Public Key**: (copy the long key under "anon public")

## Step 2: Update .env File

Replace `your-anon-key-here` in the `.env` file with your actual anon key.

## Step 3: Run Database Migrations

Go to the SQL Editor in Supabase:
https://app.supabase.com/project/yahsswggpgreawugloxi/sql/new

Copy and run this SQL:

```sql
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
CREATE INDEX IF NOT EXISTS idx_images_type ON images(type);
CREATE INDEX IF NOT EXISTS idx_images_total_votes ON images(total_votes DESC);
CREATE INDEX IF NOT EXISTS idx_votes_image_id ON votes(image_id);

-- Create stored procedure for updating stats
CREATE OR REPLACE FUNCTION update_image_stats(image_id INT, is_correct BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE images 
  SET 
    total_votes = total_votes + 1,
    correct_votes = CASE WHEN is_correct THEN correct_votes + 1 ELSE correct_votes END
  WHERE id = image_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Images are viewable by everyone" ON images
    FOR SELECT USING (true);

CREATE POLICY "Anyone can submit images" ON images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can vote" ON votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);

-- Allow updates for vote counting
CREATE POLICY "System can update image stats" ON images
    FOR UPDATE USING (true);
```

## Step 4: Optional - Import Existing Data

If you want to import your local SQLite data to Supabase, run this script:

```bash
node migrate-to-supabase.js
```

## Step 5: Test Connection

Set your environment to production and test:

```bash
NODE_ENV=production npm start
```

## Step 6: Deploy to Vercel

Add these environment variables in Vercel:
- `NODE_ENV`: `production`
- `SUPABASE_URL`: `https://yahsswggpgreawugloxi.supabase.co`
- `SUPABASE_ANON_KEY`: (your anon key)

Then deploy:
```bash
vercel --prod
```