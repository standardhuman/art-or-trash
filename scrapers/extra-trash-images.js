const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

// More diverse trash images to balance the dataset
const extraTrashImages = [
    // Actual Garbage & Waste
    { url: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b', title: 'overflowing dumpster', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807', title: 'landfill site', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1561060511-cbc4e0c12a46', title: 'plastic bottles pile', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'trash bags street', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18', title: 'recycling bin overflow', source: 'Unsplash' },
    
    // Bathroom & Hygiene Waste
    { url: 'https://images.pexels.com/photos/4239547/pexels-photo-4239547.jpeg', title: 'dirty toilet', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/4210610/pexels-photo-4210610.jpeg', title: 'clogged drain', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/6942027/pexels-photo-6942027.jpeg', title: 'used tissues', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg', title: 'bathroom trash', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/5218021/pexels-photo-5218021.jpeg', title: 'dirty sink', source: 'Pexels' },
    
    // Fast Food Waste
    { url: 'https://images.unsplash.com/photo-1629032355262-6fce3a86e9a7', title: 'fast food wrappers', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1572204292164-b35ba943fca7', title: 'pizza boxes pile', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1617330527074-71423ab309b8', title: 'takeout containers', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'food court trash', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c', title: 'greasy napkins', source: 'Unsplash' },
    
    // Electronic Waste
    { url: 'https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg', title: 'broken phones', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/9324361/pexels-photo-9324361.jpeg', title: 'e-waste pile', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/6990574/pexels-photo-6990574.jpeg', title: 'old computers dump', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/3850526/pexels-photo-3850526.jpeg', title: 'cable mess', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/7262894/pexels-photo-7262894.jpeg', title: 'battery waste', source: 'Pexels' },
    
    // Medical & Hazardous Waste
    { url: 'https://images.pexels.com/photos/3993212/pexels-photo-3993212.jpeg', title: 'medical waste bin', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/6252683/pexels-photo-6252683.jpeg', title: 'used masks pile', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/7088526/pexels-photo-7088526.jpeg', title: 'biohazard container', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/3850838/pexels-photo-3850838.jpeg', title: 'chemical waste', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/9562127/pexels-photo-9562127.jpeg', title: 'hospital waste', source: 'Pexels' },
    
    // Automotive & Industrial
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'oil spill garage', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1567644120332-9ef2542cb8e6', title: 'tire dump', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', title: 'scrap metal heap', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1591848478625-de43268e6fb8', title: 'car parts junkyard', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b', title: 'motor oil container', source: 'Unsplash' },
    
    // Organic Waste
    { url: 'https://images.pexels.com/photos/2382894/pexels-photo-2382894.jpeg', title: 'compost pile', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/9218754/pexels-photo-9218754.jpeg', title: 'rotting vegetables', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/7656994/pexels-photo-7656994.jpeg', title: 'moldy bread', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/7129141/pexels-photo-7129141.jpeg', title: 'food waste bin', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/6591166/pexels-photo-6591166.jpeg', title: 'spoiled fruit', source: 'Pexels' },
    
    // Household Clutter
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'junk drawer mess', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5', title: 'garage sale leftovers', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1571079977755-1b3d3b9ce860', title: 'attic junk', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', title: 'basement clutter', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50', title: 'closet floor pile', source: 'Unsplash' },
    
    // Public Space Litter
    { url: 'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg', title: 'beach litter', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/3480494/pexels-photo-3480494.jpeg', title: 'park trash', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/2309266/pexels-photo-2309266.jpeg', title: 'sidewalk gum', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/6591427/pexels-photo-6591427.jpeg', title: 'bus stop litter', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg', title: 'festival aftermath', source: 'Pexels' },
    
    // Weird & Gross
    { url: 'https://images.pixabay.com/photos/toilet-paper-hygiene-role-wc-3964492.jpg', title: 'used toilet paper', source: 'Pixabay' },
    { url: 'https://images.pixabay.com/photos/trash-can-garbage-can-bucket-3467157.jpg', title: 'maggots in trash', source: 'Pixabay' },
    { url: 'https://images.pixabay.com/photos/dustbin-trash-garbage-waste-5213239.jpg', title: 'overflowing bin', source: 'Pixabay' },
    { url: 'https://images.pixabay.com/photos/plastic-waste-bottles-garbage-5973417.jpg', title: 'floating garbage', source: 'Pixabay' },
    { url: 'https://images.pixabay.com/photos/garbage-waste-plastic-pollution-4277613.jpg', title: 'pollution pile', source: 'Pixabay' }
];

async function insertExtraTrashImages() {
    console.log('Inserting extra trash images to balance the dataset...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const image of extraTrashImages) {
        db.run(
            `INSERT OR IGNORE INTO images (url, source, type, title) 
             VALUES (?, ?, ?, ?)`,
            [image.url, image.source, 'trash', image.title],
            (err) => {
                if (err) {
                    console.error('Error inserting trash image:', err);
                    errorCount++;
                } else {
                    successCount++;
                }
            }
        );
    }
    
    // Wait a bit for all inserts to complete
    setTimeout(() => {
        console.log(`\nExtra trash image insertion completed!`);
        console.log(`Successfully added: ${successCount} images`);
        console.log(`Errors: ${errorCount}`);
        
        // Get final counts
        db.get('SELECT COUNT(*) as count FROM images WHERE type = "art"', (err, artRow) => {
            db.get('SELECT COUNT(*) as count FROM images WHERE type = "trash"', (err2, trashRow) => {
                console.log(`\nFinal database stats:`);
                console.log(`Art images: ${artRow.count}`);
                console.log(`Trash images: ${trashRow.count}`);
                console.log(`Total images: ${artRow.count + trashRow.count}`);
                console.log(`Balance: ${Math.round((trashRow.count / (artRow.count + trashRow.count)) * 100)}% trash`);
                db.close();
            });
        });
    }, 2000);
}

insertExtraTrashImages().catch(console.error);