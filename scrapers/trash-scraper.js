const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

// Predefined trash/garbage images from various public sources
const trashImages = [
    // Wikimedia Commons public domain images
    { url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Garbage_dump_in_Accra.jpg', source: 'Wikimedia Commons' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Landfill_in_Malaysia.jpg', source: 'Wikimedia Commons' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Garbage_pile.jpg', source: 'Wikimedia Commons' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Trash_on_street.jpg', source: 'Wikimedia Commons' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Dumpster_garbage.jpg', source: 'Wikimedia Commons' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Waste_dump_site.jpg', source: 'Wikimedia Commons' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Littered_beach.jpg', source: 'Wikimedia Commons' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Plastic_waste.jpg', source: 'Wikimedia Commons' },
    
    // Pexels free stock photos (trash/garbage themed)
    { url: 'https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/3735202/pexels-photo-3735202.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/1480690/pexels-photo-1480690.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/2382894/pexels-photo-2382894.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/3186574/pexels-photo-3186574.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/4577719/pexels-photo-4577719.jpeg', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/5218021/pexels-photo-5218021.jpeg', source: 'Pexels' },
    
    // Unsplash free photos (trash/garbage themed)
    { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1563305007-7e2f3a72fb76', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1610141160723-d2d346e73766', source: 'Unsplash' },
    
    // Pixabay free images
    { url: 'https://cdn.pixabay.com/photo/2016/11/21/15/59/garbage-1846132_960_720.jpg', source: 'Pixabay' },
    { url: 'https://cdn.pixabay.com/photo/2017/08/23/03/50/garbage-2671608_960_720.jpg', source: 'Pixabay' },
    { url: 'https://cdn.pixabay.com/photo/2019/05/20/21/03/plastic-4217736_960_720.jpg', source: 'Pixabay' },
    { url: 'https://cdn.pixabay.com/photo/2019/03/08/21/23/waste-4043277_960_720.jpg', source: 'Pixabay' },
    { url: 'https://cdn.pixabay.com/photo/2016/10/24/23/11/garbage-1767543_960_720.jpg', source: 'Pixabay' },
    { url: 'https://cdn.pixabay.com/photo/2020/08/08/12/41/trash-5472821_960_720.jpg', source: 'Pixabay' },
    { url: 'https://cdn.pixabay.com/photo/2018/10/18/15/25/garbage-3756585_960_720.jpg', source: 'Pixabay' },
    { url: 'https://cdn.pixabay.com/photo/2021/12/14/21/29/trash-6871352_960_720.jpg', source: 'Pixabay' }
];

const trashDescriptions = [
    'garbage pile',
    'trash heap',
    'waste dump',
    'landfill',
    'street litter',
    'dumpster overflow',
    'plastic waste',
    'rubbish collection'
];

async function insertTrashImages() {
    console.log('Starting trash image insertion...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const image of trashImages) {
        const randomDesc = trashDescriptions[Math.floor(Math.random() * trashDescriptions.length)];
        
        db.run(
            `INSERT INTO images (url, source, type, title) 
             VALUES (?, ?, ?, ?)`,
            [image.url, image.source, 'trash', randomDesc],
            (err) => {
                if (err) {
                    console.error('Error inserting trash image:', err);
                    errorCount++;
                } else {
                    successCount++;
                }
                
                // Check if we're done
                if (successCount + errorCount === trashImages.length) {
                    console.log(`\nTrash image insertion completed!`);
                    console.log(`Successfully added: ${successCount} images`);
                    console.log(`Errors: ${errorCount}`);
                    db.close();
                }
            }
        );
    }
}

insertTrashImages().catch(console.error);