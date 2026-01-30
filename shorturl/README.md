# Short URL Structure

This folder contains short URL redirectors for song landing pages. Each subfolder represents a song and contains an `index.html` that redirects to the corresponding track landing page in `tracks/`.

## Purpose
- Provides clean URLs like `skydevaaben.no/shorturl/song-slug/` for accessing song landing pages.
- Handles `cid` parameters for tracking (e.g., from Meta campaigns).
- Allows user choice on landing pages (e.g., click to open Spotify) vs. auto-redirects (like `gp/`).

## Current Structure
- `lwy/`: For "Lost Without You (Lucid)"
  - Redirects to `tracks/lost-without-you-lucid/index.html`
  - Default `cid`: `org-fb-lwy-r1`

## How to Add a New Song
To add a new song (e.g., "new-song"), follow these steps:

1. **Create the Track Landing Page**:
   - Copy `tracks/lost-without-you-lucid/index.html` to `tracks/new-song/index.html`.
   - Update the script variables:
     - `TRACK_SLUG`: Set to `"new-song"`
     - `UTM_CAMPAIGN`: Set to `"new-song"`
     - `DESTINATIONS`: Update the `baseUrl` to the new song's Spotify URL (e.g., `"https://open.spotify.com/track/NEW_TRACK_ID"`)
     - `spotifyId`: Update to the new track ID
   - Update HTML metadata (title, description, images) for the new song.

2. **Create the Short URL Redirector**:
   - Create a new subfolder: `shorturl/new-song/`
   - Add `index.html` inside it (copy from `shorturl/lwy/index.html`).
   - Update the script:
     - `targetBase`: Change to `"https://skydevaaben.no/tracks/new-song/index.html"`
     - Default `cid`: Set to something like `"org-fb-new-song-r1"` (adjust based on platforms/reels)

3. **Test**:
   - Visit `skydevaaben.no/shorturl/new-song/?cid=test` to ensure it redirects to the landing page.
   - Verify the button opens the correct Spotify track.

4. **Commit and Deploy**:
   - Add, commit, and push the changes.
   - Deploy to update the live site.

## Notes
- For auto-redirect songs (like GP), use the `gp/` structure instead.
- This process can be automated in a tools repo by scripting the file copies and variable replacements.
- Ensure `cid` values are unique per campaign for accurate tracking.