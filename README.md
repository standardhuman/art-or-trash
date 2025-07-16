# Art or Trash?

A "hot or not" style web game that challenges users to distinguish between genuine museum art and images of trash.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Scrape images (this populates the database):
```bash
npm run scrape
```

3. Start the server:
```bash
npm start
```

4. Open http://localhost:3000 in your browser

## Features

- Random pairing of museum art vs trash images
- Vote tracking and statistics
- Sources art from major museums including:
  - Metropolitan Museum of Art
  - Rijksmuseum (via OAI-PMH API - no key required)
  - Art Institute of Chicago
- Scrapes trash images from web searches

## Notes

- First run of scrapers will take several minutes to populate the database
- Images are stored by URL reference, not downloaded locally