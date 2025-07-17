const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

// Humorous and vague trash descriptions
const humorousTrashDescriptions = [
    "mysterious urban artifact",
    "sidewalk surprise",
    "forgotten treasure",
    "street confetti", 
    "urban tumbleweed",
    "concrete garnish",
    "pavement decoration",
    "gutter gallery piece",
    "dumpster delicacy",
    "trash can triumph",
    "landfill luxury",
    "refuse romance",
    "garbage glamour",
    "waste wonderland",
    "litter literature",
    "debris delight",
    "rubbish revelation",
    "junk junction jewel",
    "discard disco",
    "throwaway theater",
    "bin bounty",
    "scrap sculpture",
    "refuse renaissance",
    "trash treasure",
    "waste wisdom",
    "garbage garden",
    "litter landscape",
    "debris dream",
    "rubbish romance",
    "junk jazz",
    "discard drama",
    "throwaway thesis",
    "bin ballet",
    "scrap symphony",
    "refuse rhapsody",
    "municipal meditation",
    "sidewalk serenade",
    "gutter gospel",
    "pavement poetry",
    "concrete composition",
    "urban ugliness",
    "street stuff",
    "ground findings",
    "floor fortune",
    "surface surprise",
    "mysterious mess",
    "unidentified sitting object",
    "former something",
    "ex-useful item",
    "retired object",
    "post-purpose material",
    "undefined detritus",
    "ambiguous abandonment",
    "questionable quality",
    "dubious deposit",
    "suspicious substance",
    "cryptic crud",
    "enigmatic excess",
    "puzzling pile",
    "baffling bits",
    "perplexing pieces",
    "mystifying matter",
    "confounding collection",
    "bewildering bunch",
    "strange stuff",
    "odd objects",
    "weird waste",
    "peculiar pile",
    "curious crud",
    "bizarre bits",
    "uncanny collection",
    "eerie excess",
    "spooky scraps",
    "haunted heap",
    "cursed collection",
    "forbidden fragments",
    "taboo trash",
    "naughty nuggets",
    "scandalous scraps",
    "controversial crud",
    "disputed debris",
    "contested collection",
    "disputed discard",
    "argumentative artifact",
    "belligerent bits",
    "cantankerous crud",
    "grumpy garbage",
    "moody materials",
    "temperamental trash",
    "emotional excess",
    "feeling fragments",
    "sentimental scraps",
    "nostalgic nuggets",
    "melancholy materials",
    "wistful waste",
    "yearning yuck",
    "longing litter",
    "pining pieces",
    "romantic rubbish",
    "loving litter",
    "affectionate artifacts",
    "tender trash",
    "gentle garbage",
    "kind crud",
    "nice nuggets",
    "pleasant pieces",
    "delightful debris",
    "charming chunks",
    "lovely litter",
    "beautiful bits",
    "gorgeous garbage",
    "stunning scraps",
    "magnificent mess",
    "splendid spill",
    "glorious grime",
    "radiant rubbish",
    "shining shards",
    "gleaming garbage",
    "sparkling scraps",
    "twinkling trash",
    "glittering gunk",
    "shimmering shards",
    "lustrous litter",
    "brilliant bits",
    "dazzling debris",
    "spectacular spill"
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