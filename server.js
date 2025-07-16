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
  db.get('SELECT * FROM images ORDER BY RANDOM() LIMIT 1', (err, image) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!image) return res.status(404).json({ error: 'No images found' });
    
    res.json(image);
  });
});

app.post('/api/vote', (req, res) => {
  const { imageId, vote } = req.body;
  
  db.run('INSERT INTO votes (image_id, vote) VALUES (?, ?)', [imageId, vote], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});