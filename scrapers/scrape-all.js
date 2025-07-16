const { exec } = require('child_process');
const path = require('path');

console.log('Starting full scraping process...\n');

exec(`node ${path.join(__dirname, 'museum-scraper.js')}`, (err, stdout, stderr) => {
    if (err) {
        console.error('Museum scraper error:', err);
        return;
    }
    console.log('Museum scraper output:', stdout);
    if (stderr) console.error('Museum scraper stderr:', stderr);
    
    console.log('\nNow scraping trash images...\n');
    
    exec(`node ${path.join(__dirname, 'trash-scraper.js')}`, (err, stdout, stderr) => {
        if (err) {
            console.error('Trash scraper error:', err);
            return;
        }
        console.log('Trash scraper output:', stdout);
        if (stderr) console.error('Trash scraper stderr:', stderr);
        
        console.log('\nAll scraping completed!');
    });
});