require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();

// Check for Supabase credentials
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY === 'your-anon-key-here') {
  console.error('❌ Please set your Supabase credentials in .env file');
  console.error('   SUPABASE_URL and SUPABASE_ANON_KEY are required');
  process.exit(1);
}

// Initialize connections
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const sqliteDb = new sqlite3.Database('./database.db');

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to Supabase...\n');
  
  try {
    // First, clear existing data to avoid conflicts
    console.log('🧹 Clearing existing Supabase data...');
    await supabase.from('votes').delete().neq('id', 0);
    await supabase.from('images').delete().neq('id', 0);
    
    // Migrate images (handling duplicates)
    console.log('📸 Migrating images...');
    const images = await new Promise((resolve, reject) => {
      // Get unique images by URL
      sqliteDb.all(`
        SELECT url, source, type, title, artist, museum, 
               MAX(total_votes) as total_votes, MAX(correct_votes) as correct_votes
        FROM images 
        GROUP BY url
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`   Found ${images.length} unique images to migrate`);
    
    if (images.length > 0) {
      // Insert images in batches
      const batchSize = 50;
      for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);
        const { data: insertedImages, error: imageError } = await supabase
          .from('images')
          .insert(batch.map(img => ({
            url: img.url,
            source: img.source,
            type: img.type,
            title: img.title,
            artist: img.artist,
            museum: img.museum,
            total_votes: img.total_votes || 0,
            correct_votes: img.correct_votes || 0
          })))
          .select();
        
        if (imageError) {
          console.error('❌ Error migrating batch:', imageError);
        } else {
          console.log(`   ✅ Migrated batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(images.length/batchSize)} (${insertedImages.length} images)`);
        }
      }
    }
    
    // Verify migration
    console.log('\n📊 Verifying migration...');
    const { count: imageCount } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✅ Images in Supabase: ${imageCount}`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('   You can now use NODE_ENV=production to run with Supabase');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    sqliteDb.close();
  }
}

// Run migration
migrateData();