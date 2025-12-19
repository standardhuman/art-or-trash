require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4444;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Database adapter based on environment
let db;
if (isProduction && process.env.SUPABASE_URL) {
  // Use Supabase in production
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  db = {
    getRandomImage: async (type) => {
      // Use PostgreSQL RPC function for efficient server-side random selection
      const { data, error } = await supabase.rpc('get_random_image', {
        image_type: type || null
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    
    getImage: async (id) => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    insertVote: async (imageId, vote, confidence = 'normal', userId = null) => {
      const { error } = await supabase
        .from('votes')
        .insert({ image_id: imageId, vote, confidence, user_id: userId });
      if (error) throw error;
    },
    
    updateImageStats: async (imageId, isCorrect) => {
      const { error } = await supabase.rpc('update_image_stats', {
        image_id: imageId,
        is_correct: isCorrect
      });
      if (error) throw error;
    },
    
    getStats: async () => {
      // Supabase doesn't support direct aggregation in select, so we need to aggregate in JavaScript
      const { data, error } = await supabase
        .from('images')
        .select('type, total_votes, correct_votes');
      if (error) throw error;
      
      // Aggregate the results
      const aggregated = data.reduce((acc, row) => {
        if (!acc[row.type]) {
          acc[row.type] = {
            type: row.type,
            total_votes: 0,
            correct_votes: 0
          };
        }
        acc[row.type].total_votes += row.total_votes || 0;
        acc[row.type].correct_votes += row.correct_votes || 0;
        return acc;
      }, {});
      
      return Object.values(aggregated);
    },
    
    insertImage: async (imageData) => {
      const { data, error } = await supabase
        .from('images')
        .insert(imageData)
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error('This image URL already exists');
        }
        throw error;
      }
      return data;
    },
    
    getImageVoteStats: async (imageId) => {
      const { data, error } = await supabase
        .from('votes')
        .select('vote')
        .eq('image_id', imageId);
      if (error) throw error;
      
      const stats = { art: 0, trash: 0, total: 0 };
      data.forEach(vote => {
        stats[vote.vote]++;
        stats.total++;
      });
      
      return stats;
    }
  };
} else {
  // Use SQLite for local development
  const sqlite3 = require('sqlite3').verbose();
  const sqliteDb = new sqlite3.Database('./database.db');
  
  // Initialize tables
  sqliteDb.serialize(() => {
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT,
      artist TEXT,
      museum TEXT,
      total_votes INTEGER DEFAULT 0,
      correct_votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_id INTEGER,
      vote TEXT NOT NULL,
      confidence TEXT DEFAULT 'normal',
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (image_id) REFERENCES images (id)
    )`);
  });
  
  db = {
    getRandomImage: (type) => {
      return new Promise((resolve, reject) => {
        const query = type 
          ? 'SELECT * FROM images WHERE type = ? ORDER BY RANDOM() LIMIT 1'
          : 'SELECT * FROM images ORDER BY RANDOM() LIMIT 1';
        const params = type ? [type] : [];
        
        sqliteDb.get(query, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    
    getImage: (id) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get('SELECT * FROM images WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    
    insertVote: (imageId, vote, confidence = 'normal', userId = null) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run('INSERT INTO votes (image_id, vote, confidence, user_id) VALUES (?, ?, ?, ?)',
          [imageId, vote, confidence, userId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    
    updateImageStats: (imageId, isCorrect) => {
      return new Promise((resolve, reject) => {
        const query = isCorrect
          ? 'UPDATE images SET total_votes = total_votes + 1, correct_votes = correct_votes + 1 WHERE id = ?'
          : 'UPDATE images SET total_votes = total_votes + 1 WHERE id = ?';
        
        sqliteDb.run(query, [imageId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    
    getStats: () => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            type,
            SUM(total_votes) as total_votes,
            SUM(correct_votes) as correct_votes
          FROM images
          GROUP BY type
        `;
        
        sqliteDb.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    
    insertImage: (imageData) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get('SELECT id FROM images WHERE url = ?', [imageData.url], (err, existing) => {
          if (err) return reject(err);
          if (existing) return reject(new Error('This image URL already exists'));
          
          sqliteDb.run(
            `INSERT INTO images (url, source, type, title, artist, museum) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [imageData.url, imageData.source, imageData.type, 
             imageData.title, imageData.artist, imageData.museum],
            function(err) {
              if (err) reject(err);
              else resolve({ id: this.lastID });
            }
          );
        });
      });
    },
    
    getImageVoteStats: (imageId) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all('SELECT vote FROM votes WHERE image_id = ?', [imageId], (err, rows) => {
          if (err) return reject(err);
          
          const stats = { art: 0, trash: 0, total: 0 };
          rows.forEach(row => {
            stats[row.vote]++;
            stats.total++;
          });
          
          resolve(stats);
        });
      });
    }
  };
}

// API Routes
app.get('/api/random-image', async (req, res) => {
  try {
    const showArt = Math.random() < 0.5;
    const image = await db.getRandomImage(showArt ? 'art' : 'trash');
    
    if (!image) {
      // Fallback to any image
      const fallback = await db.getRandomImage();
      return res.json(fallback || { error: 'No images found' });
    }
    
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vote', async (req, res) => {
  try {
    const { imageId, vote, confidence = 'normal', userId = null } = req.body;

    const image = await db.getImage(imageId);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const isCorrect = (image.type === 'art' && vote === 'art') ||
                     (image.type === 'trash' && vote === 'trash');

    await db.insertVote(imageId, vote, confidence, userId);
    await db.updateImageStats(imageId, isCorrect);

    // Get voting statistics for this image
    const voteStats = await db.getImageVoteStats(imageId);

    // Calculate prediction accuracy if user made confident vote
    let predictionResult = null;
    if (confidence === 'confident') {
      const artPercent = voteStats.total > 0 ? (voteStats.art / voteStats.total) * 100 : 50;
      const winningPercent = Math.max(artPercent, 100 - artPercent);
      const isLandslide = winningPercent >= 71;
      predictionResult = isLandslide ? 'correct' : 'incorrect';
    }

    res.json({
      success: true,
      voteStats: voteStats,
      predictionResult,
      actualType: image.type,
      imageDetails: {
        title: image.title,
        artist: image.artist,
        museum: image.museum
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/image-stats/:imageId', async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const voteStats = await db.getImageVoteStats(imageId);
    
    res.json({ 
      success: true, 
      voteStats: voteStats 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    
    const formattedStats = stats.map(stat => ({
      type: stat.type,
      total_votes: stat.total_votes || 0,
      voted_art: stat.type === 'art' ? (stat.correct_votes || 0) : (stat.total_votes - stat.correct_votes || 0),
      voted_trash: stat.type === 'trash' ? (stat.correct_votes || 0) : (stat.total_votes - stat.correct_votes || 0)
    }));
    
    res.json(formattedStats);
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
    
    // Check if it's a data URL and validate
    if (url.startsWith('data:')) {
      // Extract mime type
      const mimeMatch = url.match(/^data:([^;]+);/);
      if (!mimeMatch || !mimeMatch[1].startsWith('image/')) {
        return res.status(400).json({ error: 'Invalid image data' });
      }
      
      // Check size (rough estimate - base64 is ~33% larger than binary)
      const base64Length = url.length - url.indexOf(',') - 1;
      const estimatedSize = base64Length * 0.75;
      if (estimatedSize > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({ error: 'Image size exceeds 5MB limit' });
      }
    }
    
    const result = await db.insertImage({
      url,
      source: source || 'User Submission',
      type,
      title: title || (type === 'art' ? 'Untitled' : 'unidentified material'),
      artist: artist || 'Unknown',
      museum: museum || 'User Submission'
    });
    
    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Using ${isProduction ? 'Supabase' : 'SQLite'} database`);
});