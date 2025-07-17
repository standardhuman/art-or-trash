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
    // Test Supabase connection
    const { error: testError } = await supabase.from('images').select('count').limit(1);
    if (testError) {
      console.error('❌ Could not connect to Supabase:', testError.message);
      console.error('   Please check your credentials and ensure tables are created');
      process.exit(1);
    }
    
    // Migrate images
    console.log('📸 Migrating images...');
    const images = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM images', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`   Found ${images.length} images to migrate`);
    
    if (images.length > 0) {
      // Batch insert images
      const { data: insertedImages, error: imageError } = await supabase
        .from('images')
        .upsert(images.map(img => ({
          url: img.url,
          source: img.source,
          type: img.type,
          title: img.title,
          artist: img.artist,
          museum: img.museum,
          total_votes: img.total_votes || 0,
          correct_votes: img.correct_votes || 0
        })), { onConflict: 'url' })
        .select();
      
      if (imageError) {
        console.error('❌ Error migrating images:', imageError);
      } else {
        console.log(`   ✅ Successfully migrated ${insertedImages.length} images`);
      }
    }
    
    // Get ID mapping for votes migration
    const { data: supabaseImages } = await supabase
      .from('images')
      .select('id, url');
    
    const urlToId = {};
    supabaseImages.forEach(img => {
      urlToId[img.url] = img.id;
    });
    
    // Map SQLite image IDs to URLs
    const sqliteIdToUrl = {};
    images.forEach(img => {
      sqliteIdToUrl[img.id] = img.url;
    });
    
    // Migrate votes
    console.log('\n🗳️  Migrating votes...');
    const votes = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM votes', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`   Found ${votes.length} votes to migrate`);
    
    if (votes.length > 0) {
      // Map votes to new image IDs
      const mappedVotes = votes
        .map(vote => {
          const imageUrl = sqliteIdToUrl[vote.image_id];
          const newImageId = imageUrl ? urlToId[imageUrl] : null;
          
          if (!newImageId) {
            console.warn(`   ⚠️  Could not map vote for image_id ${vote.image_id}`);
            return null;
          }
          
          return {
            image_id: newImageId,
            vote: vote.vote
          };
        })
        .filter(vote => vote !== null);
      
      if (mappedVotes.length > 0) {
        // Batch insert votes (in chunks to avoid size limits)
        const chunkSize = 1000;
        for (let i = 0; i < mappedVotes.length; i += chunkSize) {
          const chunk = mappedVotes.slice(i, i + chunkSize);
          const { error: voteError } = await supabase
            .from('votes')
            .insert(chunk);
          
          if (voteError) {
            console.error(`❌ Error migrating votes chunk ${i/chunkSize + 1}:`, voteError);
          } else {
            console.log(`   ✅ Migrated votes ${i + 1} to ${Math.min(i + chunkSize, mappedVotes.length)}`);
          }
        }
      }
    }
    
    // Verify migration
    console.log('\n📊 Verifying migration...');
    const { count: imageCount } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true });
    
    const { count: voteCount } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✅ Images in Supabase: ${imageCount}`);
    console.log(`   ✅ Votes in Supabase: ${voteCount}`);
    
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