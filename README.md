# Skydevaaben

Music landing pages and short URL redirects for Sky.AI tracks, hosted on GitHub Pages.

## Overview

This repository contains landing pages for various music tracks by Sky.AI and related artists. Each track has its own landing page with:

- Custom background images
- Spotify integration with tracking
- Meta Pixel analytics for campaign measurement
- Follow artist CTAs for supported artists (Sky.AI, After Brügge, Skydevaaben)
- Cookie consent handling
- Mobile-optimized design

## Architecture

### Shared Assets
- `tracks/scripts/common.css` - Shared styles for layout, buttons, and follow CTAs
- `tracks/scripts/common.js` - Shared JavaScript for tracking, click handling, and artist detection

### Track Pages
Each track page in `tracks/` follows a consistent structure:
- Links to shared `common.css` and `common.js`
- Inline background CSS for unique visuals
- Track-specific variables (DESTINATIONS, TRACK_SLUG, UTM_CAMPAIGN)
- Automatic follow CTA injection for supported artists

### Short URLs
Ultra-short redirects in `r/` folder for social media sharing, each with unique tracking CIDs.

## Songs

The repository contains landing pages for numerous tracks. Some highlights:

- [All Clear Now](tracks/all-clear-now/index.html)
- [Lost Without You Lucid](tracks/lost-without-you-lucid/index.html)
- [Glass People](tracks/glass-people/index.html)
- [Fire Without A Flame](tracks/fire-without-a-flame/index.html)
- [Bleeding (Synthwave Instrumental)](tracks/bleeding-synthwave-instrumental/index.html)
- [Born Again (Crimson Echo)](tracks/born-again-crimson-echo/index.html)
- [Low (Crimson Echo)](tracks/low-crimson-echo/index.html)
- [Please (Afterimage)](tracks/please-afterimage/index.html)

See the `tracks/` directory for the complete list of available landing pages.

## Development

### Adding New Tracks
1. Create a new folder in `tracks/` with the track slug
2. Create `index.html` with basic HTML structure
3. Link to `../scripts/common.css` and `../scripts/common.js`
4. Add inline background style and track variables
5. Test locally with Python HTTP server

### Generator Tool
Use the [Redirect Generator](https://tools.skydevaaben.no) to create new landing pages and short URLs programmatically.

## Recent Updates

- **2025**: Refactored all track pages to use shared `common.css` and `common.js` for maintainability
- **2025**: Added follow artist CTAs for Sky.AI, After Brügge, and Skydevaaben tracks
- **2025**: Implemented Meta Pixel tracking for campaign analytics
- **2025**: Standardized cookie consent and click handling across all pages

## License
All rights reserved.