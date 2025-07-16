require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4444;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(express.json());
app.use(express.static('public'));

app.get('/api/random-image', async (req, res) => {
  try {
    // 50/50 chance of art or trash
    const showArt = Math.random() < 0.5;
    
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('type', showArt ? 'art' : 'trash')
      .order('RANDOM()')
      .limit(1)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vote', async (req, res) => {
  try {
    const { imageId, vote } = req.body;
    
    // Get image type
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('type')
      .eq('id', imageId)
      .single();
    
    if (imageError) throw imageError;
    
    const isCorrect = (image.type === 'art' && vote === 'art') || 
                     (image.type === 'trash' && vote === 'trash');
    
    // Insert vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({ image_id: imageId, vote });
    
    if (voteError) throw voteError;
    
    // Update image statistics
    const { error: updateError } = await supabase.rpc('update_image_stats', {
      image_id: imageId,
      is_correct: isCorrect
    });
    
    if (updateError) throw updateError;
    
    res.json({ success: true, isCorrect });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('type, total_votes, correct_votes')
      .in('type', ['art', 'trash']);
    
    if (error) throw error;
    
    // Aggregate stats by type
    const stats = data.reduce((acc, img) => {
      if (!acc[img.type]) {
        acc[img.type] = { 
          type: img.type, 
          total_votes: 0, 
          voted_art: 0, 
          voted_trash: 0 
        };
      }
      acc[img.type].total_votes += img.total_votes;
      if (img.type === 'art') {
        acc[img.type].voted_art += img.correct_votes;
        acc[img.type].voted_trash += img.total_votes - img.correct_votes;
      } else {
        acc[img.type].voted_trash += img.correct_votes;
        acc[img.type].voted_art += img.total_votes - img.correct_votes;
      }
      return acc;
    }, {});
    
    res.json(Object.values(stats));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    const { url, type, title, artist, museum, source } = req.body;
    
    if (!url || !type) {
      return res.status(400).json({ error: 'URL and type are required' });
    }
    
    if (type !== 'art' && type !== 'trash') {
      return res.status(400).json({ error: 'Type must be either "art" or "trash"' });
    }
    
    const { data, error } = await supabase
      .from('images')
      .insert({
        url,
        source: source || 'User Submission',
        type,
        title,
        artist,
        museum
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'This image URL already exists' });
      }
      throw error;
    }
    
    res.json({ success: true, id: data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create stored procedure for updating stats
const createStoredProcedure = `
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
`;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Using Supabase database');
});