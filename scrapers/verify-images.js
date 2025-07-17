const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const db = new sqlite3.Database('../database.db');

// Track results
const results = {
    total: 0,
    valid: 0,
    broken: [],
    bySource: {}
};

async function checkImageUrl(url) {
    try {
        const response = await axios.head(url, {
            timeout: 5000,
            validateStatus: function (status) {
                return status >= 200 && status < 400; // Accept redirects
            },
            maxRedirects: 5
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function verifyImages() {
    console.log('Starting image verification...\n');
    
    return new Promise((resolve, reject) => {
        db.all('SELECT id, url, source, type, title FROM images', async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            results.total = rows.length;
            console.log(`Checking ${results.total} images...\n`);
            
            // Check images in batches to avoid overwhelming the system
            const batchSize = 10;
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                const promises = batch.map(async (row) => {
                    const isValid = await checkImageUrl(row.url);
                    
                    if (!results.bySource[row.source]) {
                        results.bySource[row.source] = { total: 0, broken: 0 };
                    }
                    results.bySource[row.source].total++;
                    
                    if (isValid) {
                        results.valid++;
                    } else {
                        results.broken.push({
                            id: row.id,
                            url: row.url,
                            source: row.source,
                            type: row.type,
                            title: row.title
                        });
                        results.bySource[row.source].broken++;
                    }
                    
                    return isValid;
                });
                
                await Promise.all(promises);
                
                // Progress update
                const checked = Math.min(i + batchSize, rows.length);
                console.log(`Progress: ${checked}/${results.total} (${Math.round(checked/results.total * 100)}%)`);
            }
            
            resolve();
        });
    });
}

async function removeBrokenImages() {
    if (results.broken.length === 0) {
        console.log('\nNo broken images to remove!');
        return;
    }
    
    console.log(`\nRemoving ${results.broken.length} broken images...`);
    
    const ids = results.broken.map(img => img.id);
    const placeholders = ids.map(() => '?').join(',');
    
    db.run(`DELETE FROM images WHERE id IN (${placeholders})`, ids, (err) => {
        if (err) {
            console.error('Error removing broken images:', err);
        } else {
            console.log(`Successfully removed ${results.broken.length} broken images`);
        }
    });
}

async function main() {
    try {
        await verifyImages();
        
        console.log('\n=== VERIFICATION RESULTS ===');
        console.log(`Total images: ${results.total}`);
        console.log(`Valid images: ${results.valid} (${Math.round(results.valid/results.total * 100)}%)`);
        console.log(`Broken images: ${results.broken.length} (${Math.round(results.broken.length/results.total * 100)}%)`);
        
        console.log('\n=== BROKEN IMAGES BY SOURCE ===');
        for (const [source, stats] of Object.entries(results.bySource)) {
            if (stats.broken > 0) {
                console.log(`${source}: ${stats.broken}/${stats.total} broken (${Math.round(stats.broken/stats.total * 100)}%)`);
            }
        }
        
        if (results.broken.length > 0) {
            console.log('\n=== SAMPLE BROKEN URLS ===');
            results.broken.slice(0, 5).forEach(img => {
                console.log(`- [${img.type}] ${img.title}: ${img.url.substring(0, 80)}...`);
            });
            
            // Ask to remove broken images
            console.log('\nRemoving broken images from database...');
            await removeBrokenImages();
        }
        
        // Final stats
        db.get('SELECT COUNT(*) as count FROM images', (err, row) => {
            console.log(`\nFinal image count: ${row.count}`);
            db.close();
        });
        
    } catch (error) {
        console.error('Error during verification:', error);
        db.close();
    }
}

main();