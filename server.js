const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 4444;

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    museum TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER,
    vote TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images (id)
  )`);
});

app.use(express.json());
app.use(express.static('public'));

app.get('/api/random-image', (req, res) => {
  // 50/50 chance of art or trash
  const showArt = Math.random() < 0.5;
  const query = showArt 
    ? 'SELECT * FROM images WHERE type = "art" ORDER BY RANDOM() LIMIT 1'
    : 'SELECT * FROM images WHERE type = "trash" ORDER BY RANDOM() LIMIT 1';
    
  db.get(query, (err, image) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!image) {
      // Fallback to any image if specific type not found
      db.get('SELECT * FROM images ORDER BY RANDOM() LIMIT 1', (err, fallbackImage) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!fallbackImage) return res.status(404).json({ error: 'No images found' });
        res.json(fallbackImage);
      });
    } else {
      res.json(image);
    }
  });
});

app.post('/api/vote', (req, res) => {
  const { imageId, vote } = req.body;
  
  // First get the image type
  db.get('SELECT type FROM images WHERE id = ?', [imageId], (err, image) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    const isCorrect = (image.type === 'art' && vote === 'art') || 
                     (image.type === 'trash' && vote === 'trash');
    
    // Insert vote
    db.run('INSERT INTO votes (image_id, vote) VALUES (?, ?)', [imageId, vote], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update image statistics
      const updateQuery = isCorrect
        ? 'UPDATE images SET total_votes = total_votes + 1, correct_votes = correct_votes + 1 WHERE id = ?'
        : 'UPDATE images SET total_votes = total_votes + 1 WHERE id = ?';
        
      db.run(updateQuery, [imageId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, isCorrect });
      });
    });
  });
});

app.get('/api/stats', (req, res) => {
  const query = `
    SELECT 
      i.type,
      COUNT(CASE WHEN v.vote = 'art' THEN 1 END) as voted_art,
      COUNT(CASE WHEN v.vote = 'trash' THEN 1 END) as voted_trash,
      COUNT(v.id) as total_votes
    FROM images i
    LEFT JOIN votes v ON i.id = v.image_id
    GROUP BY i.type
  `;
  
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/submit', (req, res) => {
  const { url, type, title, artist, museum, source } = req.body;
  
  // Validate required fields
  if (!url || !type) {
    return res.status(400).json({ error: 'URL and type are required' });
  }
  
  if (type !== 'art' && type !== 'trash') {
    return res.status(400).json({ error: 'Type must be either "art" or "trash"' });
  }
  
  // Check if URL already exists
  db.get('SELECT id FROM images WHERE url = ?', [url], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(400).json({ error: 'This image URL already exists' });
    
    // Insert new image
    db.run(
      `INSERT INTO images (url, source, type, title, artist, museum) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [url, source || 'User Submission', type, title, artist, museum],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});