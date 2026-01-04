# Skydevaaben Redirect Generator

This tool lets you generate and publish redirect HTML files plus OG images directly to the GitHub repo via the GitHub API.

## What token is needed?
- Use a GitHub Personal Access Token (fine-grained is recommended).
- Scope: Repository permissions → Contents: Read and Write.
- Restrict the token to the `strikewolf76/skydevaaben` repository.

## Create a fine-grained token
1. Open GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
2. Give it a name and short expiry.
3. Resource owner: your account.
4. Repository access: Only selected repositories → `skydevaaben`.
5. Repository permissions: Contents → Read and Write (required). Others optional/not needed.
6. Generate the token and copy it.

## Use the token in the generator
1. Open `tools/generator.html` in your browser (double-click or serve locally).
2. Fill in fields, upload the OG image, and select destinations/channels.
3. Paste the token in the "Fine-grained PAT (Contents: Read+Write)" field.
4. Optionally tick "Husk token" to store it in `sessionStorage` for this session only.
5. Upload a square source image (height > 630). The generator will blur it as background and center the foreground at 1200×630.
6. Click "Publish to GitHub". The tool will:
   - PUT `assets/og/<slug>.jpg` (generated from the canvas)
   - PUT `tracks/<slug>/<dest>/<utm_content>.html` for each destination/channel

## Notes
- The token is used only by your browser; it is not stored in the repo. If you check "Husk token", it’s kept in `sessionStorage` and cleared when the tab/session ends.
- You can preview files without publishing by clicking "Generate batch (preview log)".
- Pages URLs are constructed using the base URL (default `https://strikewolf76.github.io/skydevaaben`).
- If publishing fails, verify the token has the correct repo access and permissions.
