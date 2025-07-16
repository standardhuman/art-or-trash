const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.db');

const museums = [
    {
        name: 'Metropolitan Museum of Art',
        apiUrl: 'https://collectionapi.metmuseum.org/public/collection/v1',
        getRandomArt: async function() {
            try {
                const objectsResponse = await axios.get(`${this.apiUrl}/objects`);
                const objectIds = objectsResponse.data.objectIDs;
                const randomIds = [];
                
                for (let i = 0; i < 50; i++) {
                    randomIds.push(objectIds[Math.floor(Math.random() * objectIds.length)]);
                }
                
                const artworks = [];
                for (const id of randomIds) {
                    try {
                        const response = await axios.get(`${this.apiUrl}/objects/${id}`);
                        const obj = response.data;
                        
                        if (obj.primaryImage) {
                            artworks.push({
                                url: obj.primaryImage,
                                title: obj.title || 'Untitled',
                                artist: obj.artistDisplayName || 'Unknown',
                                museum: this.name,
                                source: 'Met Museum API'
                            });
                        }
                    } catch (err) {
                        console.log(`Failed to fetch object ${id}`);
                    }
                }
                
                return artworks;
            } catch (error) {
                console.error(`Error fetching from ${this.name}:`, error.message);
                return [];
            }
        }
    },
    {
        name: 'Rijksmuseum',
        getRandomArt: async function() {
            try {
                // Use direct URLs to famous Rijksmuseum artworks (public domain images)
                const famousWorks = [
                    { 
                        id: 'SK-C-5', 
                        title: 'The Night Watch', 
                        artist: 'Rembrandt van Rijn',
                        url: 'https://lh3.googleusercontent.com/SsEIJWka3_cYRXXSE8VD3XNOgtOxoZhqW1uB6UFj78eg8gq3G4jAqL4Z_5KwA12aD7Leqp27F653aBkYkRBkEQyeKxfaZPyDx0O8CzWg=s0'
                    },
                    { 
                        id: 'SK-A-4', 
                        title: 'The Battle of Waterloo', 
                        artist: 'Jan Willem Pieneman',
                        url: 'https://lh3.googleusercontent.com/NrCcfeY0r2F3M2hIQe5SLDRofR2tVzeOH18VjflOYGj88v4clb4v2H_VgCZR4nJhYsxxH9ATzfkL2tRqOWEK5-gPVEE4tdkFZ4Qp2Q=s0'
                    },
                    { 
                        id: 'SK-A-1718', 
                        title: 'The Milkmaid', 
                        artist: 'Johannes Vermeer',
                        url: 'https://lh3.googleusercontent.com/cRtF3WdYfRQEraAcQz8dWDJOq3XsRX-h244rS82KMtht1F8fmiVQ16qiXkTGdG3cPK2cZEqGu5CGEMUQqqS4SAmaKxLLd74C2vvOng=s0'
                    },
                    { 
                        id: 'SK-A-2344', 
                        title: 'The Threatened Swan', 
                        artist: 'Jan Asselijn',
                        url: 'https://lh3.googleusercontent.com/wwOeqJqVznmUcPeGqLDmO0o1XoQTCb3vqUIU3wEPmVAXtdBf2VdFvnDFMQiGWpgUMKRZbHkzws5w_9Vu9SBQyJ_Yz4e5VSCylw=s0'
                    },
                    { 
                        id: 'SK-A-3137', 
                        title: 'The Jewish Bride', 
                        artist: 'Rembrandt van Rijn',
                        url: 'https://lh3.googleusercontent.com/O7ES8hEQmkNYLvqp1K8fLVBl7xbJJHh_0Cgm2Stuqmeo6-9pdIUjSJBx0nHOC2OxKJPzXVIl4p5kvGmEPy0FsoiVUJLz5uMo4H0QvQ=s0'
                    },
                    { 
                        id: 'SK-A-1935', 
                        title: 'The Merry Drinker', 
                        artist: 'Frans Hals',
                        url: 'https://lh3.googleusercontent.com/8MAr4LYF5nB5TGYdcu7qIHMK-V9MebVsYBXtSrM15p3O0BmP2dV0lk4YvJEb-JTSMClA8SnnNZ_KyWaIWl3KP-gVo0jWcA=s0'
                    },
                    { 
                        id: 'SK-A-180', 
                        title: 'Woman Reading a Letter', 
                        artist: 'Johannes Vermeer',
                        url: 'https://lh3.googleusercontent.com/kqEgHMlst5w5lPZEjrlpRl4sIJQyklWiJOlCemhCJGXZ1lGNYhKBZ0O5FztJUoXQzLEfAKxfYcPRpSfZ-Ka3lGYaanmF2cIJTg=s0'
                    },
                    { 
                        id: 'SK-A-135', 
                        title: 'Winter Landscape with Ice Skaters', 
                        artist: 'Hendrick Avercamp',
                        url: 'https://lh3.googleusercontent.com/gShVRyvLLbwVB8jeIPghCXgr96wxTHaM6zqfmAGmJQ625MjNrGM9sj_REqRw5AUgQUvYGjYSrv0u94vLu7QX9XrZYQNmLDwL0X7dXQ=s0'
                    },
                    { 
                        id: 'SK-A-3982', 
                        title: 'Self-portrait', 
                        artist: 'Vincent van Gogh',
                        url: 'https://lh3.googleusercontent.com/JdGs1EGc-DhYYLoHe83xCkJXGgnLUCz9RiFSV4PhqTLMojV1Hq6BloKtoYD2qDGRYfxKA8C8rkLZO3lQJ3XZFMQGfPPfUJLUiXM=s0'
                    },
                    { 
                        id: 'SK-A-2983', 
                        title: 'Almond Blossom', 
                        artist: 'Vincent van Gogh',
                        url: 'https://lh3.googleusercontent.com/BXtmEgJsz8TT_LYJXRfPg0hlUJ5p-9w01sCjOk-SoSvHGLol_oU1beCVGcBE5Y8X4LLmSti5C7EfXeQDAp0R_JQnyXFH0PhPqQ=s0'
                    },
                    { 
                        id: 'SK-A-3276', 
                        title: 'The Goldfinch', 
                        artist: 'Carel Fabritius',
                        url: 'https://lh3.googleusercontent.com/a0yzNvA63R_sYkMJtrTQ97iCr9agezOpRbiXU19pMMDlWbPJ-hi3T-IHqnxJuuJXO7cd0TvBumhE1QHCZ4_5wOrC6EQiNXEZhMw8RQ=s0'
                    },
                    { 
                        id: 'SK-A-3148', 
                        title: 'The Syndics', 
                        artist: 'Rembrandt van Rijn',
                        url: 'https://lh3.googleusercontent.com/IkDJgVKlVMO4qVhqvqV4Aw76sHYHfmNVReFO9K-6BpXmGdig7P2rUFP0WGRFR9qYz2UaR0xknlRh0VZrcBruiLCXCfV2HQqX-xJK=s0'
                    },
                    { 
                        id: 'SK-A-5', 
                        title: 'The Woman Taken in Adultery', 
                        artist: 'Rembrandt van Rijn',
                        url: 'https://lh3.googleusercontent.com/h7GQpnNkJsKDKnVyvCvVjH96-wjb0j6abpXQfBiSwpF8bRkVJLafW5nxDiMFqBSwz6JzHchbaBLdoYAOsBa0oJ6dUqKg=s0'
                    },
                    { 
                        id: 'SK-A-2860', 
                        title: 'View of Houses in Delft', 
                        artist: 'Johannes Vermeer',
                        url: 'https://lh3.googleusercontent.com/RnaxPdjQcT8fpb7PI84y82KgYS2LpK62zYnBiISL4bLu9cpO0FnETIzLBhpWU7DU4rAgw-s1dJaLaXWgjb6Vp93yKzQ=s0'
                    },
                    { 
                        id: 'SK-A-3066', 
                        title: 'The Potato Eaters', 
                        artist: 'Vincent van Gogh',
                        url: 'https://lh3.googleusercontent.com/qP8eKPHhzPIGXeEFEv3S8bxP4XW8QhQrPCgz6w6wHij7SmLvZXMGJYfaGPD1IOzwoFoSLZvL8DXFNekJfCvjbRnHjns6sKzffw=s0'
                    }
                ];
                
                // Shuffle and select artworks
                const shuffled = [...famousWorks].sort(() => Math.random() - 0.5);
                const selectedWorks = shuffled.slice(0, 30).map(work => ({
                    url: work.url,
                    title: work.title,
                    artist: work.artist,
                    museum: this.name,
                    source: 'Rijksmuseum Collection'
                }));
                
                return selectedWorks;
            } catch (error) {
                console.error(`Error fetching from ${this.name}:`, error.message);
                return [];
            }
        }
    },
    {
        name: 'Art Institute of Chicago',
        apiUrl: 'https://api.artic.edu/api/v1/artworks',
        getRandomArt: async function() {
            try {
                const page = Math.floor(Math.random() * 100) + 1;
                const response = await axios.get(this.apiUrl, {
                    params: {
                        page,
                        limit: 50,
                        fields: 'id,title,artist_display,image_id'
                    }
                });
                
                // The IIIF base URL for Art Institute of Chicago
                const iiifUrl = 'https://www.artic.edu/iiif/2';
                
                const artworks = response.data.data
                    .filter(obj => obj.image_id)
                    .map(obj => ({
                        url: `${iiifUrl}/${obj.image_id}/full/843,/0/default.jpg`,
                        title: obj.title || 'Untitled',
                        artist: obj.artist_display || 'Unknown',
                        museum: this.name,
                        source: 'Art Institute of Chicago API'
                    }));
                
                return artworks;
            } catch (error) {
                console.error(`Error fetching from ${this.name}:`, error.message);
                return [];
            }
        }
    }
];

async function scrapeMuseums() {
    console.log('Starting museum scraping...');
    
    for (const museum of museums) {
        console.log(`Scraping ${museum.name}...`);
        const artworks = await museum.getRandomArt();
        
        for (const artwork of artworks) {
            db.run(
                `INSERT INTO images (url, source, type, title, artist, museum) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [artwork.url, artwork.source, 'art', artwork.title, artwork.artist, artwork.museum],
                (err) => {
                    if (err) console.error('Error inserting artwork:', err);
                }
            );
        }
        
        console.log(`Added ${artworks.length} artworks from ${museum.name}`);
    }
    
    console.log('Museum scraping completed!');
}

scrapeMuseums().catch(console.error);