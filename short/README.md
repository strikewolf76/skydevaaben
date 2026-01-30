# Short Redirect Links

This folder contains short redirect links for various tracks on skydevaaben.no. Each track has its own subfolder named after the track slug (e.g., `lwy` for "Lost Without You (Lucid)").

## Structure

- `lwy/`: Redirect links for "Lost Without You (Lucid)"
  - `yt-r1.html`: Redirect for YouTube round 1
  - `yt-r2.html`: Redirect for YouTube round 2
  - `yt-r3.html`: Redirect for YouTube round 3
  - `ig-r1.html`: Redirect for Instagram round 1
  - `ig-r2.html`: Redirect for Instagram round 2
  - `ig-r3.html`: Redirect for Instagram round 3
  - `fb-r1.html`: Redirect for Facebook round 1
  - `fb-r2.html`: Redirect for Facebook round 2
  - `fb-r3.html`: Redirect for Facebook round 3
  - `tt-r1.html`: Redirect for TikTok round 1
  - `tt-r2.html`: Redirect for TikTok round 2
  - `tt-r3.html`: Redirect for TikTok round 3

Each HTML file is a simple redirect page that appends a campaign ID (`cid`) to the main track page URL, allowing for tracking different marketing campaigns.

## How It Works

- Visiting `https://skydevaaben.no/short/lwy/yt-r1.html` will redirect to `https://skydevaaben.no/tracks/lost-without-you-lucid/index.html?cid=org-yt-lwy-r1`
- The redirect preserves any additional query parameters passed to the short link.

## Testing

To test a redirect link:

1. Open a web browser.
2. Navigate to `https://skydevaaben.no/short/lwy/yt-r1.html` (replace with the actual deployed URL).
3. Verify that you are redirected to the track page with the correct `cid` parameter in the URL.
4. Check that the page loads the correct content and tracks the campaign appropriately.

For local testing before deployment:

1. Serve the `skydevaaben` folder using a local web server (e.g., `python -m http.server` in the `skydevaaben` directory).
2. Visit `http://localhost:8000/short/lwy/yt-r1.html`.
3. Confirm the redirect to `http://localhost:8000/tracks/lost-without-you-lucid/index.html?cid=org-yt-lwy-r1`.