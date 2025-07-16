# Art or Trash - Feature List

## Core Features
- **Hot or Not Style Game**: Single image display with Art/Trash voting buttons
- **50/50 Distribution**: Equal chance of showing art or trash images
- **Museum Art Collection**: 
  - Metropolitan Museum of Art (API)
  - Rijksmuseum (Famous works)
  - Art Institute of Chicago (API)
- **Trash Image Collection**: Curated collection from various sources

## User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Modern UI**: Card-based design with hover effects
- **Visual Feedback**: Color-coded results (green for correct, red for wrong)
- **Auto-advance**: Automatically moves to next image after 3 seconds
- **Loading States**: Placeholder for broken images

## Keyboard Shortcuts
- `1` - Vote Art
- `2` - Vote Trash
- `Space/Enter` - Next Image
- `←/Backspace` - Previous Image

## Navigation Features
- **Image History**: Stores last 50 viewed images
- **Back Button**: Review previous images with their correct answers
- **Info Display**: Shows artwork details when going back

## Statistics & Tracking
- **Global Stats**: Shows accuracy for art vs trash recognition
- **Per-Image Accuracy**: Tracks success rate for each individual image
- **Vote History**: Complete database of all votes
- **Real-time Updates**: Stats refresh with each vote

## User Submissions
- **Submit Page**: `/submit.html` for user contributions
- **Image Preview**: Live preview of submitted URLs
- **Validation**: Checks for duplicate URLs
- **Type-specific Fields**: Additional fields for art submissions

## Technical Features
- **SQLite Database**: Lightweight local storage
- **Express.js Server**: RESTful API endpoints
- **Git Version Control**: Full commit history
- **Playwright Tests**: Comprehensive test suite
- **Performance Tests**: Load time and response benchmarks

## Deployment Ready
- **Vercel Configuration**: Ready for instant deployment
- **Supabase Migration**: Prepared for cloud database
- **Static Assets**: Optimized for CDN delivery
- **Environment Config**: Supports development and production

## API Endpoints
- `GET /api/random-image` - Get random image (50/50 art/trash)
- `POST /api/vote` - Submit vote and update statistics
- `GET /api/stats` - Get global voting statistics
- `POST /api/submit` - Submit new image

## Database Schema
- **images**: Stores all artwork and trash images
- **votes**: Records every vote made
- **image_stats**: View with calculated accuracy percentages
- **Migrations**: Version-controlled schema changes