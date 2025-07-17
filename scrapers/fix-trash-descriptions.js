const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

// Understated trash descriptions
const humorousTrashDescriptions = [
    "discarded item",
    "sidewalk debris",
    "abandoned object",
    "litter", 
    "urban refuse",
    "concrete fragment",
    "pavement residue",
    "gutter contents",
    "dumpster material",
    "trash receptacle contents",
    "landfill specimen",
    "refuse sample",
    "garbage item",
    "waste material",
    "litter sample",
    "debris fragment",
    "rubbish item",
    "junk piece",
    "discarded material",
    "thrown away item",
    "bin contents",
    "scrap material",
    "refuse item",
    "trash item",
    "waste product",
    "garbage specimen",
    "litter fragment",
    "debris sample",
    "rubbish specimen",
    "junk fragment",
    "discard",
    "throwaway item",
    "bin specimen",
    "scrap piece",
    "refuse fragment",
    "municipal waste",
    "sidewalk material",
    "gutter debris",
    "pavement waste",
    "concrete debris",
    "urban litter",
    "street refuse",
    "ground debris",
    "floor waste",
    "surface debris",
    "unidentified object",
    "unidentified material",
    "former item",
    "discarded object",
    "abandoned material",
    "waste fragment",
    "undefined material",
    "unspecified item",
    "questionable material",
    "unverified object",
    "suspicious material",
    "unidentified substance",
    "excess material",
    "accumulated debris",
    "collected fragments",
    "assembled pieces",
    "clustered matter",
    "grouped collection",
    "bundled material",
    "misc. debris",
    "various objects",
    "mixed waste",
    "assorted pile",
    "random debris",
    "miscellaneous bits",
    "mixed collection",
    "excess material",
    "surplus scraps",
    "leftover heap",
    "remaining collection",
    "residual fragments",
    "excess debris",
    "surplus nuggets",
    "leftover scraps",
    "extra debris",
    "additional collection",
    "supplemental discard",
    "secondary fragments",
    "extra bits",
    "spare debris",
    "backup material",
    "reserve trash",
    "standby debris",
    "alternative fragments",
    "substitute scraps",
    "replacement debris",
    "alternative material",
    "backup fragments",
    "reserve scraps",
    "standby material",
    "substitute debris",
    "replacement fragments",
    "alternative scraps",
    "backup material",
    "reserve fragments",
    "standby scraps",
    "substitute material",
    "replacement debris",
    "alternative fragments",
    "backup scraps",
    "reserve material",
    "standby fragments",
    "substitute scraps",
    "replacement material",
    "alternative debris",
    "backup fragments",
    "reserve scraps",
    "standby material",
    "substitute debris",
    "replacement fragments",
    "alternative scraps",
    "backup material",
    "reserve fragments",
    "standby scraps",
    "substitute material",
    "replacement debris",
    "alternative fragments",
    "backup scraps",
    "reserve material",
    "standby fragments",
    "substitute scraps",
    "replacement material"
];

// Function to get a random humorous description
function getRandomDescription() {
    return humorousTrashDescriptions[Math.floor(Math.random() * humorousTrashDescriptions.length)];
}

async function updateTrashDescriptions() {
    console.log('Updating trash image descriptions with humorous alternatives...');
    
    // Get all trash images
    db.all('SELECT id, title, url FROM images WHERE type = "trash"', (err, rows) => {
        if (err) {
            console.error('Error fetching trash images:', err);
            return;
        }
        
        console.log(`Found ${rows.length} trash images to update`);
        
        let updateCount = 0;
        let errorCount = 0;
        
        // Update each trash image with a random humorous description
        rows.forEach((row, index) => {
            const newTitle = getRandomDescription();
            
            db.run(
                'UPDATE images SET title = ? WHERE id = ?',
                [newTitle, row.id],
                (err) => {
                    if (err) {
                        console.error(`Error updating image ${row.id}:`, err);
                        errorCount++;
                    } else {
                        updateCount++;
                        if (updateCount % 10 === 0) {
                            console.log(`Updated ${updateCount} descriptions...`);
                        }
                    }
                    
                    // Check if we're done
                    if (updateCount + errorCount === rows.length) {
                        console.log(`\nDescription update completed!`);
                        console.log(`Successfully updated: ${updateCount} images`);
                        console.log(`Errors: ${errorCount}`);
                        console.log(`\nTrash images now have delightfully vague and humorous descriptions!`);
                        
                        // Show a few examples
                        db.all('SELECT title FROM images WHERE type = "trash" ORDER BY RANDOM() LIMIT 5', (err, samples) => {
                            if (!err) {
                                console.log('\nSample descriptions:');
                                samples.forEach(s => console.log(`- ${s.title}`));
                            }
                            db.close();
                        });
                    }
                }
            );
        });
    });
}

updateTrashDescriptions().catch(console.error);