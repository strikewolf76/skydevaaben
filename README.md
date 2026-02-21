# Skydevaaben

Static music landing pages, redirects, and campaign tracking assets for https://skydevaaben.no.

## Quick Links
- Live site: https://skydevaaben.no
- Redirect index: https://skydevaaben.no/r/
- Generator (publishes here): https://tools.skydevaaben.no
- Generator source repo: https://github.com/strikewolf76/skydevaaben-tools

## What this repo contains
- Track landing pages with shared runtime behavior (play links, UTM handling, follow CTA, consent logic)
- Ultra-short social redirect routes for campaign links
- OG image assets and generated QR codes
- Redirect index UI for browsing social slugs

## Repository Structure
- `tracks/` – one folder per release page (`tracks/<track-slug>/index.html`)
- `tracks/scripts/common.css` – shared landing page styles
- `tracks/scripts/common.js` – shared click handling, UTM/pixel logic, follow CTA injection
- `shorturl/` – short redirect entry points (`shorturl/<shortslug>/index.html`)
- `r/` – platform/reel redirects (`r/<platform><shortslug><n>/index.html`) plus redirect index data/UI
- `assets/og/` – OG images (`.jpg`, `-bg.jpg`, `-fg.jpg`)
- `qrs/` – generated QR PNGs

## Runtime Flow
1. User opens a campaign redirect (`/r/...`)
2. Redirect forwards to `/shorturl/...` and preserves/sets `cid`
3. Short URL forwards to `/tracks/<slug>/index.html?cid=...`
4. Track page (`common.js`) applies UTMs, tracking, and follow CTA logic

## Authoring Workflow (Recommended)
Use the generator for all new releases and campaign redirects.

1. Create content in the generator
2. Publish to this repo (`main`)
3. Verify redirect chain and track page behavior live

This keeps `r/data.js` and redirect slugs synchronized with generated files.

## Validation Checklist
For each new release, verify:
- Track page renders and CTA buttons work
- Follow CTA appears for supported artists
- `cid` survives full redirect chain (`r -> shorturl -> tracks`)
- UTM params are present on outbound destinations
- New slugs appear in redirect index (`/r/`)

## Related Artist Support
Current shared landing logic supports artist follow CTA mapping for:
- Sky.AI
- After Brügge
- Skydevaaben

## Deployment
GitHub Pages serves this repo from `main` root with custom domain `skydevaaben.no`.

## License
All rights reserved.