const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

// More ambiguous "not art" images - everyday objects that could look artistic
const moreAmbiguousNotArt = [
    // Food & Kitchen Items Artfully Arranged
    { url: 'https://images.unsplash.com/photo-1558642891-54be180ea339', title: 'coffee cup rings', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7', title: 'broken eggshells', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1625948515291-69613efd103f', title: 'spilled flour', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5', title: 'kitchen utensils shadow', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b', title: 'crumpled paper', source: 'Unsplash' },
    
    // Urban Decay & Graffiti
    { url: 'https://images.unsplash.com/photo-1560707854-fb9a10eeaace', title: 'peeling paint wall', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1531685250784-7569952593d2', title: 'abandoned shopping cart', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1552580535-c1d24c36e7b8', title: 'broken glass', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'graffiti tags', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', title: 'torn posters', source: 'Unsplash' },
    
    // Office & Tech Waste
    { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18', title: 'tangled cables', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704', title: 'old keyboards', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'printer test page', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1607861716497-e65ab29e5610', title: 'crumpled receipts', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c', title: 'dead pixels screen', source: 'Unsplash' },
    
    // Construction & Industrial
    { url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122', title: 'concrete mixer stains', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1565008576549-57569a49371d', title: 'oil stains', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', title: 'scaffolding shadows', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'cement splatter', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1624381261613-84e5de0c346f', title: 'construction debris', source: 'Unsplash' },
    
    // Nature Debris
    { url: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16', title: 'dead leaves pile', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a', title: 'bird droppings', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41', title: 'mud puddle', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1571079977755-1b3d3b9ce860', title: 'algae on water', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1597200381847-30ec200eeb9a', title: 'rotting wood', source: 'Unsplash' },
    
    // Minimalist Trash
    { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18', title: 'single plastic bag', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1572204292164-b35ba943fca7', title: 'crushed can', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65', title: 'cigarette butt', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807', title: 'gum on pavement', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1621274283550-fb89c9e0d2ed', title: 'bottle cap', source: 'Unsplash' }
];

// More controversial/conceptual art pieces
const moreAmbiguousArt = [
    // Conceptual Art Pieces
    {
        url: 'https://d7hftxdivxxvm.cloudfront.net/?resize_to=width&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2FsM-k-H9KvQN1yP9kfLK3Ew%252F3409456352_9d1e75d908_o.jpg&width=1200&quality=80',
        title: '4\'33"',
        artist: 'John Cage',
        museum: 'MoMA',
        source: 'Artsy'
    },
    {
        url: 'https://www.artic.edu/iiif/2/25c31d8d-21a4-9ea1-1d73-6a2eca4dda7e/full/843,/0/default.jpg',
        title: 'Floor Piece No. 1',
        artist: 'Walter De Maria',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/4a5645db-52f2-1f25-9b25-db9f4445e14f/full/843,/0/default.jpg',
        title: 'Untitled (Placebo)',
        artist: 'Felix Gonzalez-Torres',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    
    // Found Object Art
    {
        url: 'https://www.artic.edu/iiif/2/b94f6361-8ff5-3cc3-ece5-be1b4135e0fe/full/843,/0/default.jpg',
        title: 'Bottle Rack',
        artist: 'Marcel Duchamp',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/3ee42420-82a7-2cb0-338f-d87c4ad6331e/full/843,/0/default.jpg',
        title: 'Shovel',
        artist: 'Marcel Duchamp',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    
    // Minimalist Paintings That Look Like Nothing
    {
        url: 'https://www.artic.edu/iiif/2/34160100-df13-de81-ee94-40112464c435/full/843,/0/default.jpg',
        title: 'White on White',
        artist: 'Robert Ryman',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/8a661384-3c0e-3e3e-ef5e-e8b64e95e5f0/full/843,/0/default.jpg',
        title: 'Untitled (Blue Monochrome)',
        artist: 'Yves Klein',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    
    // Installation Art That Looks Like Garbage
    {
        url: 'https://d7hftxdivxxvm.cloudfront.net/?resize_to=width&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2F6BL7pMveZAHZ5mEKYIpYiw%252Flarger-4.jpg&width=1200&quality=80',
        title: 'Untitled (Portrait of Ross in L.A.)',
        artist: 'Felix Gonzalez-Torres',
        museum: 'MoMA',
        source: 'Artsy'
    },
    {
        url: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
        title: 'Pile of Coal',
        artist: 'Bernar Venet',
        museum: 'MoMA',
        source: 'Pexels'
    },
    {
        url: 'https://www.artic.edu/iiif/2/a4439639-cd72-dcd6-c1a9-d4f988cf5e8a/full/843,/0/default.jpg',
        title: 'Untitled (Mylar)',
        artist: 'Tara Donovan',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    
    // Performance Art Documentation
    {
        url: 'https://www.artic.edu/iiif/2/44915998-2f77-e32a-3174-bde9cf02c4fa/full/843,/0/default.jpg',
        title: 'I Am Making Art',
        artist: 'John Baldessari',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/7e6ac508-f6a0-b9c8-0af5-2ac955eb10f1/full/843,/0/default.jpg',
        title: 'Untitled (Hair)',
        artist: 'Janine Antoni',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    
    // Text-Based Art
    {
        url: 'https://www.artic.edu/iiif/2/656d6a8f-3233-a473-29a2-24ca52de3bcf/full/843,/0/default.jpg',
        title: 'Five Words in Green Neon',
        artist: 'Joseph Kosuth',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/7033f013-d632-3a27-0d5f-44d0cf1e3e59/full/843,/0/default.jpg',
        title: 'Truisms',
        artist: 'Jenny Holzer',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/79d14332-9a8f-088f-4bdc-3520baba4e07/full/843,/0/default.jpg',
        title: 'EVERYTHING IS GOING TO BE ALRIGHT',
        artist: 'Martin Creed',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    }
];

async function insertMoreAmbiguousImages() {
    console.log('Inserting additional ambiguous images...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert "not art" images
    for (const image of moreAmbiguousNotArt) {
        db.run(
            `INSERT OR IGNORE INTO images (url, source, type, title) 
             VALUES (?, ?, ?, ?)`,
            [image.url, image.source, 'trash', image.title],
            (err) => {
                if (err) {
                    console.error('Error inserting not-art image:', err);
                    errorCount++;
                } else {
                    successCount++;
                }
            }
        );
    }
    
    // Insert ambiguous art
    for (const artwork of moreAmbiguousArt) {
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
    
    // Wait a bit for all inserts to complete
    setTimeout(() => {
        console.log(`\nAdditional ambiguous image insertion completed!`);
        console.log(`Successfully added: ${successCount} images`);
        console.log(`Errors: ${errorCount}`);
        console.log(`\nThe game is now even more challenging with ${moreAmbiguousNotArt.length + moreAmbiguousArt.length} new ambiguous images!`);
        db.close();
    }, 2000);
}

insertMoreAmbiguousImages().catch(console.error);