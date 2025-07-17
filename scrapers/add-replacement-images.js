const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

// Working trash images from reliable sources
const workingTrashImages = [
    // Street & Urban (Unsplash)
    { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18', title: 'sidewalk debris', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'urban refuse', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807', title: 'unidentified material', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b', title: 'dumpster contents', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1561060511-cbc4e0c12a46', title: 'pavement debris', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3', title: 'gutter contents', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18', title: 'concrete fragments', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1621640786029-220e9ff8dd09', title: 'street waste', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a', title: 'litter', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a', title: 'debris', source: 'Unsplash' },
    
    // Industrial & Construction (Pexels)  
    { url: 'https://images.pexels.com/photos/128867/coins-currency-investment-insurance-128867.jpeg', title: 'discarded object', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/259915/pexels-photo-259915.jpeg', title: 'industrial waste', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg', title: 'construction debris', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg', title: 'mechanical refuse', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg', title: 'abandoned fragments', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg', title: 'rusted material', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/190537/pexels-photo-190537.jpeg', title: 'grease stain', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/159298/construction-site-build-construction-work-159298.jpeg', title: 'debris', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/262367/pexels-photo-262367.jpeg', title: 'rubble', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg', title: 'waste material', source: 'Pexels' },
    
    // Nature & Organic (Mixed)
    { url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41', title: 'organic waste', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16', title: 'natural debris', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1597200381847-30ec200eeb9a', title: 'decomposing material', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1571079977755-1b3d3b9ce860', title: 'mud', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a', title: 'soil', source: 'Unsplash' },
    { url: 'https://images.pexels.com/photos/2382894/pexels-photo-2382894.jpeg', title: 'compost', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/1172207/pexels-photo-1172207.jpeg', title: 'plant matter', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg', title: 'leaf litter', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg', title: 'ground debris', source: 'Pexels' },
    { url: 'https://images.pexels.com/photos/1189257/pexels-photo-1189257.jpeg', title: 'forest floor debris', source: 'Pexels' },
    
    // Household & Everyday
    { url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b', title: 'household waste', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5', title: 'household debris', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', title: 'closet contents', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50', title: 'storage debris', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1607861716497-e65ab29e5610', title: 'paper waste', source: 'Unsplash' }
];

// Working art images from reliable museum APIs
const workingArtImages = [
    // Met Museum classics
    {
        url: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/437329/795434/main-image',
        title: 'Wheat Field with Cypresses',
        artist: 'Vincent van Gogh',
        museum: 'Metropolitan Museum of Art',
        source: 'Met Museum API'
    },
    {
        url: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/437980/796067/main-image',
        title: 'The Starry Night',
        artist: 'Vincent van Gogh',
        museum: 'Metropolitan Museum of Art',
        source: 'Met Museum API'
    },
    {
        url: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/436535/1671316/main-image',
        title: 'The Great Wave off Kanagawa',
        artist: 'Katsushika Hokusai',
        museum: 'Metropolitan Museum of Art',
        source: 'Met Museum API'
    },
    {
        url: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/436524/796418/main-image',
        title: 'Bridge over a Pond of Water Lilies',
        artist: 'Claude Monet',
        museum: 'Metropolitan Museum of Art',
        source: 'Met Museum API'
    },
    {
        url: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/438821/796089/main-image',
        title: 'Young Woman with a Water Pitcher',
        artist: 'Johannes Vermeer',
        museum: 'Metropolitan Museum of Art',
        source: 'Met Museum API'
    },
    
    // Art Institute of Chicago contemporary
    {
        url: 'https://www.artic.edu/iiif/2/1adf2696-8489-499b-cad2-821d7fde4b33/full/843,/0/default.jpg',
        title: 'Nighthawks',
        artist: 'Edward Hopper',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg',
        title: 'American Gothic',
        artist: 'Grant Wood',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36e7-6a8a5d6c1d0b/full/843,/0/default.jpg',
        title: 'The Bedroom',
        artist: 'Vincent van Gogh',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/831a05de-d3f6-f4fa-a460-23008dd58dda/full/843,/0/default.jpg',
        title: 'The Old Guitarist',
        artist: 'Pablo Picasso',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/7982c8f6-b320-83d8-7d13-5c7b7fb896ff/full/843,/0/default.jpg',
        title: 'Paris Street; Rainy Day',
        artist: 'Gustave Caillebotte',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    }
];

async function insertReplacementImages() {
    console.log('Adding replacement images...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert trash images
    for (const image of workingTrashImages) {
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
    
    // Insert art images
    for (const artwork of workingArtImages) {
        db.run(
            `INSERT OR IGNORE INTO images (url, source, type, title, artist, museum) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [artwork.url, artwork.source, 'art', artwork.title, artwork.artist, artwork.museum],
            (err) => {
                if (err) {
                    console.error('Error inserting artwork:', err);
                    errorCount++;
                } else {
                    successCount++;
                }
            }
        );
    }
    
    // Wait for all inserts to complete
    setTimeout(() => {
        console.log(`\nReplacement complete!`);
        console.log(`Successfully added: ${successCount} images`);
        console.log(`Errors: ${errorCount}`);
        
        // Get final counts
        db.get('SELECT COUNT(*) as total, SUM(CASE WHEN type = "art" THEN 1 ELSE 0 END) as art, SUM(CASE WHEN type = "trash" THEN 1 ELSE 0 END) as trash FROM images', (err, row) => {
            console.log(`\nFinal database stats:`);
            console.log(`Total images: ${row.total}`);
            console.log(`Art images: ${row.art} (${Math.round(row.art/row.total * 100)}%)`);
            console.log(`Trash images: ${row.trash} (${Math.round(row.trash/row.total * 100)}%)`);
            db.close();
        });
    }, 2000);
}

insertReplacementImages().catch(console.error);