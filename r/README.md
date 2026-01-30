# Short URL Redirects

This folder contains ultra-short URL redirects for song landing pages on GitHub Pages. Each subfolder (e.g., `ytlwy1/`) has an `index.html` that redirects to the appropriate `shorturl/song-slug/` with a specific `cid` for tracking.

## Purpose
- Enables short, shareable URLs like `skydevaaben.no/r/ytlwy1` for social media (e.g., TikTok, Instagram).
- Keeps the repo root organized by containing all short URL folders in `r/`.
- Passes `cid` for precise Meta Pixel tracking per platform/reel.

## Current Short URLs
- **YouTube Shorts**:
  - `r/ytlwy1/` → `shorturl/lwy/?cid=org-yt-lwy-r1`
  - `r/ytlwy2/` → `shorturl/lwy/?cid=org-yt-lwy-r2`
  - `r/ytlwy3/` → `shorturl/lwy/?cid=org-yt-lwy-r3`
- **Instagram Reels**:
  - `r/iglwy1/` → `shorturl/lwy/?cid=org-ig-lwy-r1`
  - `r/iglwy2/` → `shorturl/lwy/?cid=org-ig-lwy-r2`
  - `r/iglwy3/` → `shorturl/lwy/?cid=org-ig-lwy-r3`
- **Facebook Reels**:
  - `r/fblwy1/` → `shorturl/lwy/?cid=org-fb-lwy-r1`
  - `r/fblwy2/` → `shorturl/lwy/?cid=org-fb-lwy-r2`
  - `r/fblwy3/` → `shorturl/lwy/?cid=org-fb-lwy-r3`
- **TikTok**:
  - `r/ttlwy1/` → `shorturl/lwy/?cid=org-tt-lwy-r1`
  - `r/ttlwy2/` → `shorturl/lwy/?cid=org-tt-lwy-r2`
  - `r/ttlwy3/` → `shorturl/lwy/?cid=org-tt-lwy-r3`

## How to Add a New Short URL
1. Create a subfolder in `r/` (e.g., `r/newshort/`).
2. Add `index.html` with a redirect script (copy from an existing one, update the `cid`).
3. Commit and push—GitHub Pages will serve `skydevaaben.no/r/newshort`.

## Notes
- These are HTML-based redirects (GitHub Pages limitation—no server redirects).
- For new songs, first set up the `shorturl/song-slug/` redirector, then create short URLs here.
- Test each URL to ensure the redirect and tracking work.