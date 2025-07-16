# Art or Not?

A challenging web game that tests your ability to distinguish genuine museum artwork from everyday objects and scenes.

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

- Single image display with Art/Not Art voting
- Keyboard shortcuts for quick gameplay
- Auto-advance after voting
- Image history with back navigation
- User submissions to expand the collection
- Sources art from major museums including:
  - Metropolitan Museum of Art
  - Rijksmuseum
  - Art Institute of Chicago
  - Contemporary and modern art pieces
- Includes carefully selected everyday objects that look artistic

## Notes

- First run of scrapers will take several minutes to populate the database
- Images are stored by URL reference, not downloaded locally