const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

// Ambiguous "not art" images - everyday objects that could look artistic
const ambiguousNotArt = [
    // Architectural/Industrial
    { url: 'https://images.unsplash.com/photo-1565008576549-57569a49371d', title: 'industrial pipes', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', title: 'concrete texture', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14', title: 'parking garage', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904', title: 'fire escape shadows', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40', title: 'cracked paint', source: 'Unsplash' },
    
    // Everyday Objects Arranged
    { url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e', title: 'stacked chairs', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a', title: 'soap bubbles', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1525857597365-5f6dbff2e36e', title: 'bicycle wheels', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1609952048180-7b35ea6b083b', title: 'power lines', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1595351298020-038700609878', title: 'folded fabric', source: 'Unsplash' },
    
    // Natural Patterns
    { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b', title: 'ocean foam', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e', title: 'cracked mud', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1597655601841-214a4cfe8b2c', title: 'tree bark pattern', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', title: 'rust patterns', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1621274283550-fb89c9e0d2ed', title: 'water ripples', source: 'Unsplash' },
    
    // Minimalist Objects
    { url: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a', title: 'empty room corner', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e', title: 'white wall texture', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d', title: 'geometric shadows', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1506452819137-0422416856b8', title: 'window blinds', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad', title: 'staircase spiral', source: 'Unsplash' }
];

// Modern/contemporary art that might look like everyday objects
const ambiguousArt = [
    // Modern Art Museum pieces (using museum APIs where available)
    { 
        url: 'https://www.moma.org/media/W1siZiIsIjU5MzA3Il0sWyJwIiwiY29udmVydCIsIi1xdWFsaXR5IDkwIC1yZXNpemUgMjAwMHgyMDAwXHUwMDNlIl1d.jpg?sha=fdc1ab6baa7f5400',
        title: 'Bicycle Wheel',
        artist: 'Marcel Duchamp',
        museum: 'MoMA',
        source: 'MoMA'
    },
    {
        url: 'https://www.tate.org.uk/art/images/work/T/T07/T07573_10.jpg',
        title: 'Fountain',
        artist: 'Marcel Duchamp',
        museum: 'Tate Modern',
        source: 'Tate'
    },
    {
        url: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Campbell%27s_Soup_Cans_by_Andy_Warhol.jpg',
        title: "Campbell's Soup Cans",
        artist: 'Andy Warhol',
        museum: 'MoMA',
        source: 'Wikimedia'
    },
    {
        url: 'https://www.artic.edu/iiif/2/3e28f919-d91e-37c6-f1f9-2a1abea8b1a1/full/843,/0/default.jpg',
        title: 'Untitled (Stack)',
        artist: 'Donald Judd',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://www.artic.edu/iiif/2/9e86dab1-5b99-8f15-bb5f-2d25abaa5bb9/full/843,/0/default.jpg',
        title: 'Equivalent VIII',
        artist: 'Carl Andre',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    
    // Contemporary installations
    {
        url: 'https://d7hftxdivxxvm.cloudfront.net/?resize_to=width&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2F2Q1CsNoJ3fN1A5OiL7mJ-Q%252F3417757448_4a78654027_o.jpg&width=1200&quality=80',
        title: 'One and Three Chairs',
        artist: 'Joseph Kosuth',
        museum: 'MoMA',
        source: 'Artsy'
    },
    {
        url: 'https://publicdelivery.org/wp-content/uploads/2019/06/Piero-Manzoni-Artist%E2%80%99s-Shit-1961.jpg',
        title: "Artist's Shit",
        artist: 'Piero Manzoni',
        museum: 'Tate Modern',
        source: 'Public Delivery'
    },
    {
        url: 'https://www.tate.org.uk/art/images/work/L/L02/L02530_10.jpg',
        title: 'An Oak Tree',
        artist: 'Michael Craig-Martin',
        museum: 'Tate Modern',
        source: 'Tate'
    },
    
    // Minimalist sculptures
    {
        url: 'https://www.artic.edu/iiif/2/0f1cc0e0-e42b-be16-3812-6c4833c30c4f/full/843,/0/default.jpg',
        title: 'Untitled',
        artist: 'Dan Flavin',
        museum: 'Art Institute of Chicago',
        source: 'Art Institute of Chicago API'
    },
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Black_Square.jpg',
        title: 'Black Square',
        artist: 'Kazimir Malevich',
        museum: 'Tretyakov Gallery',
        source: 'Wikimedia'
    }
];

async function insertAmbiguousImages() {
    console.log('Inserting ambiguous images...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert "not art" images
    for (const image of ambiguousNotArt) {
        db.run(
            `INSERT INTO images (url, source, type, title) 
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
    for (const artwork of ambiguousArt) {
        db.run(
            `INSERT INTO images (url, source, type, title, artist, museum) 
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
        console.log(`\nAmbiguous image insertion completed!`);
        console.log(`Successfully added: ${successCount} images`);
        console.log(`Errors: ${errorCount}`);
        console.log(`\nThe game is now much more challenging!`);
        db.close();
    }, 2000);
}

insertAmbiguousImages().catch(console.error);