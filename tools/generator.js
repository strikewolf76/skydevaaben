(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    repoBase: $("repoBase"),
    siteName: $("siteName"),
    ghToken: $("ghToken"),

    title: $("title"),
    trackSlug: $("trackSlug"),
    utmCampaign: $("utmCampaign"),

    destSpotify: $("destSpotify"),
    spotifyUrl: $("spotifyUrl"),
    destApple: $("destApple"),
    appleUrl: $("appleUrl"),
    destDeezer: $("destDeezer"),
    deezerUrl: $("deezerUrl"),

    chMeta: $("chMeta"),
    metaContent: $("metaContent"),
    chTikTok: $("chTikTok"),
    ttContent: $("ttContent"),
    chYouTube: $("chYouTube"),
    ytContent: $("ytContent"),
    chIGDM: $("chIGDM"),
    igdmContent: $("igdmContent"),

    ogFile: $("ogFile"),
    ogFileInfo: $("ogFileInfo"),
    ogCanvas: $("ogCanvas"),
    ogImageNamePreview: $("ogImageNamePreview"),

    validation: $("validation"),
    log: $("log"),

    btnGenerate: $("btnGenerate"),
    btnCheckToken: $("btnCheckToken"),
    btnPublish: $("btnPublish"),
    btnReset: $("btnReset"),
  };

  // ---------- utils ----------
  function normBaseUrl(s) { return (s || "").trim().replace(/\/+$/, ""); }

  function sanitizeSlug(s) {
    s = (s || "").trim().toLowerCase();
    s = s.replace(/[_\s]+/g, "-");
    s = s.replace(/[^a-z0-9-]/g, "");
    s = s.replace(/-+/g, "-");
    s = s.replace(/^-+|-+$/g, "");
    return s;
  }

  function required(name, value, errors) {
    if (!value || !String(value).trim()) errors.push(`${name} is required`);
  }

  function htmlEscape(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildUtmmedAndSource(channelKey) {
    switch (channelKey) {
      case "meta":   return { utm_source: "meta",      utm_medium: "paid_social" };
      case "tiktok": return { utm_source: "tiktok",    utm_medium: "paid_social" };
      case "youtube":return { utm_source: "youtube",   utm_medium: "paid_video"  };
      case "igdm":   return { utm_source: "instagram", utm_medium: "dm"          };
      default:       return { utm_source: "other",     utm_medium: "other"       };
    }
  }

  function appendUtms(destUrl, { utm_source, utm_medium, utm_campaign, utm_content }) {
    const u = new URL(destUrl);
    u.searchParams.set("utm_source", utm_source);
    u.searchParams.set("utm_medium", utm_medium);
    u.searchParams.set("utm_campaign", utm_campaign);
    u.searchParams.set("utm_content", utm_content);
    return u.toString();
  }

  function addLogItem({ title, lines = [], linkText, linkHref, status }) {
    const div = document.createElement("div");
    div.className = "logitem";
    const statusHtml = status ? `<div class="mono">${status}</div>` : "";
    const linkHtml = (linkHref && linkText) ? `<a href="${linkHref}" target="_blank" rel="noreferrer">${linkText}</a>` : "";
    div.innerHTML = `
      <div class="top">
        <div class="path">${title}</div>
        <div class="mono">${linkHtml}</div>
      </div>
      ${statusHtml}
      <div class="mono" style="margin-top:8px;">${lines.map(l => `${htmlEscape(l)}`).join("<br>")}</div>
    `;
    els.log.appendChild(div);
  }

  function clearLog() { els.log.innerHTML = ""; }

  function parseSpotifyTrackId(url) {
    if (!url) return null;
    try {
      const u = new URL(url.trim());
      const match = u.pathname.match(/\/track\/([A-Za-z0-9]{10,})/);
      if (match) return match[1];
    } catch (_) { /* ignore */ }
    return null;
  }

  function autoDescription({ hasSpotify, hasApple, hasDeezer }) {
    if (hasSpotify) return "Tap to open in Spotify.";
    if (hasApple) return "Tap to open in Apple Music.";
    if (hasDeezer) return "Tap to open in Deezer.";
    return "Tap to open.";
  }

  // ---------- OG image processing ----------
  const TARGET_W = 1200;
  const TARGET_H = 630;

  const OWNER = "strikewolf76";
  const REPO = "skydevaaben";
  const BRANCH = "main";

  let ogImageLoaded = false;
  let ogImageBitmap = null;
  let ogImageError = null;

  function drawOgCanvasFromBitmap() {
    const canvas = els.ogCanvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!ogImageBitmap) {
      ctx.fillStyle = "rgba(127,127,127,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(127,127,127,0.7)";
      ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.fillText("Upload a square image; final output is 1200×630", 20, 40);
      return;
    }

    const targetW = TARGET_W, targetH = TARGET_H;
    const srcW = ogImageBitmap.width, srcH = ogImageBitmap.height;

    // Background: cover + blur, inflate more to avoid edge clipping and make blur obvious
    const coverScale = Math.max(targetW / srcW, targetH / srcH) * 1.35;
    const bgW = srcW * coverScale;
    const bgH = srcH * coverScale;
    const bgX = (targetW - bgW) / 2;
    const bgY = (targetH - bgH) / 2;

    ctx.save();
    ctx.filter = "blur(70px) brightness(0.95)"; // strong blur + slight dim for contrast
    ctx.drawImage(ogImageBitmap, 0, 0, srcW, srcH, bgX, bgY, bgW, bgH);
    ctx.restore();

    // Add a subtle overlay to separate foreground
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, targetW, targetH);

    // Foreground: fit height, center horizontally
    const fgScale = targetH / srcH;
    const fgW = srcW * fgScale;
    const fgH = targetH;
    const fgX = (targetW - fgW) / 2;
    ctx.drawImage(ogImageBitmap, 0, 0, srcW, srcH, fgX, 0, fgW, fgH);
  }

  async function onOgFileSelected(file) {
    ogImageLoaded = false;
    ogImageBitmap = null;
    ogImageError = null;

    if (!file) {
      els.ogFileInfo.textContent = "";
      drawOgCanvasFromBitmap();
      validateOnly();
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      ogImageBitmap = bitmap;

      const square = bitmap.width === bitmap.height;
      const tallEnough = bitmap.height > TARGET_H;
      const messages = [`Loaded: ${file.name} (${bitmap.width}×${bitmap.height})`];
      if (!square) ogImageError = "Image must be square";
      else if (!tallEnough) ogImageError = `Image height must be > ${TARGET_H}`;

      if (ogImageError) messages.push(`INVALID: ${ogImageError}`);

      ogImageLoaded = !ogImageError;
      els.ogFileInfo.textContent = messages.join(" | ");
      drawOgCanvasFromBitmap();
      validateOnly();
    } catch (e) {
      els.ogFileInfo.textContent = `Failed to read image: ${String(e)}`;
      ogImageLoaded = false;
      ogImageBitmap = null;
      drawOgCanvasFromBitmap();
      validateOnly();
    }
  }

  async function canvasToJpegBase64(canvas, quality = 0.92) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    const arr = await blob.arrayBuffer();
    return arrayBufferToBase64(arr);
  }

  // ---------- base64 helpers ----------
  function utf8ToBase64(str) {
    // safe UTF-8 base64
    const bytes = new TextEncoder().encode(str);
    return arrayBufferToBase64(bytes.buffer);
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  // ---------- HTML generation ----------
  function generateHtml({
    title,
    siteName,
    description,
    ogUrlAbs,
    ogImageAbs,
    destType,
    spotifyTrackId,
    webUrl
  }) {
    const isSpotify = destType === "spotify";

    const appBlock = isSpotify ? `
  var TRACK_ID = "${htmlEscape(spotifyTrackId)}";
  var APP_URI = "spotify:track:" + TRACK_ID;
` : `
  var APP_URI = null;
`;

    const normalBrowserLogic = isSpotify ? `
    try {
      window.location.href = APP_URI;
      setTimeout(function () {
        window.location.href = WEB_URL;
      }, 600);
    } catch (e) {
      window.location.href = WEB_URL;
    }
` : `
    window.location.href = WEB_URL;
`;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${htmlEscape(title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="${htmlEscape(siteName)}">
  <meta property="og:title" content="${htmlEscape(title)}">
  <meta property="og:description" content="${htmlEscape(description)}">
  <meta property="og:url" content="${htmlEscape(ogUrlAbs)}">
  <meta property="og:image" content="${htmlEscape(ogImageAbs)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${htmlEscape(title)}">
  <meta name="twitter:description" content="${htmlEscape(description)}">
  <meta name="twitter:image" content="${htmlEscape(ogImageAbs)}">
</head>

<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

  <p id="status">Opening…</p>

  <p>
    <a id="play"
       href="${htmlEscape(webUrl)}"
       style="font-size:18px;padding:14px 22px;display:inline-block;">
      Open
    </a>
  </p>

<script>
(function () {${appBlock}
  var WEB_URL = "${htmlEscape(webUrl)}";

  var statusEl = document.getElementById("status");
  var playEl = document.getElementById("play");

  function isMetaInApp() {
    var ua = navigator.userAgent || "";
    return /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram|Messenger/i.test(ua);
  }

  playEl.href = WEB_URL;

  if (isMetaInApp()) {
    playEl.removeAttribute("target");
    statusEl.textContent = "Opening…";
    setTimeout(function () {
      window.location.href = WEB_URL;
    }, 150);
  } else {
    statusEl.textContent = "Opening…";
${normalBrowserLogic}
  }
})();
</script>

</body>
</html>
`;
  }

  // ---------- validation + batch build ----------
  function validateOnly() {
    const errors = [];

    const repoBase = normBaseUrl(els.repoBase.value);
    required("Pages base URL", repoBase, errors);
    if (repoBase) {
      try {
        const u = new URL(repoBase);
        if (u.protocol !== "https:") errors.push("Pages base URL must be https");
        if (!u.hostname) errors.push("Pages base URL must include a host");
      } catch {
        errors.push("Pages base URL is not a valid URL");
      }
    }

    const title = (els.title.value || "").trim();
    required("Title", title, errors);

    const slugRaw = (els.trackSlug.value || "");
    if (/_/.test(slugRaw)) errors.push("Track slug contains '_' (underscore). Use hyphens only.");
    const slug = sanitizeSlug(slugRaw);
    required("Track slug", slug, errors);

    const utmCampaign = sanitizeSlug(els.utmCampaign.value);
    required("utm_campaign", utmCampaign, errors);

    const anyDest = els.destSpotify.checked || els.destApple.checked || els.destDeezer.checked;
    if (!anyDest) errors.push("Select at least one destination.");

    let spotifyIdParsed = null;
    if (els.destSpotify.checked) {
      spotifyIdParsed = parseSpotifyTrackId(els.spotifyUrl.value || "");
      if (!spotifyIdParsed) errors.push("Spotify URL must contain a track ID");
    }
    if (els.destApple.checked) required("Apple URL", (els.appleUrl.value || "").trim(), errors);
    if (els.destDeezer.checked) required("Deezer URL", (els.deezerUrl.value || "").trim(), errors);

    const anyCh = els.chMeta.checked || els.chTikTok.checked || els.chYouTube.checked || els.chIGDM.checked;
    if (!anyCh) errors.push("Select at least one channel.");

    if (els.chMeta.checked) required("utm_content (Meta)", els.metaContent.value, errors);
    if (els.chTikTok.checked) required("utm_content (TikTok)", els.ttContent.value, errors);
    if (els.chYouTube.checked) required("utm_content (YouTube)", els.ytContent.value, errors);
    if (els.chIGDM.checked) required("utm_content (IG DM)", els.igdmContent.value, errors);

    if (!ogImageLoaded) errors.push("OG image not uploaded yet (required).");
    if (ogImageError) errors.push(ogImageError);

    els.ogImageNamePreview.textContent = slug ? `assets/og/${slug}.jpg` : "";

    if (errors.length) {
      els.validation.innerHTML = `<span class="bad">FAIL</span>\n` + errors.map(e => `- ${e}`).join("\n");
      return { ok: false, errors };
    }

    els.validation.innerHTML =
      `<span class="ok">OK</span>\n` +
      `- Publish will create/update:\n` +
      `  - assets/og/${slug}.jpg\n` +
      `  - tracks/${slug}/<dest>/<utm_content>.html\n`;

    return { ok: true };
  }

  function buildBatch() {
    const v = validateOnly();
    if (!v.ok) return null;

    const repoBase = normBaseUrl(els.repoBase.value);
    const siteName = (els.siteName.value || "").trim();
    const title = (els.title.value || "").trim();
    const spotifyIdParsed = parseSpotifyTrackId(els.spotifyUrl.value || "");

    const hasSpotify = !!(els.destSpotify.checked && spotifyIdParsed);
    const hasApple = !!els.destApple.checked;
    const hasDeezer = !!els.destDeezer.checked;
    const description = autoDescription({ hasSpotify, hasApple, hasDeezer });

    const slug = sanitizeSlug(els.trackSlug.value);
    const utm_campaign = sanitizeSlug(els.utmCampaign.value);

    const ogImageRel = `assets/og/${slug}.jpg`;
    const ogImageAbs = `${repoBase}/${ogImageRel}`;

    const destinations = [];
    if (els.destSpotify.checked) {
      const sid = spotifyIdParsed;
      destinations.push({
        key: "spotify",
        type: "spotify",
        baseUrl: `https://open.spotify.com/track/${encodeURIComponent(sid)}`,
        spotifyId: sid,
      });
    }
    if (els.destApple.checked) {
      destinations.push({ key: "apple", type: "web", baseUrl: (els.appleUrl.value || "").trim(), spotifyId: "" });
    }
    if (els.destDeezer.checked) {
      destinations.push({ key: "deezer", type: "web", baseUrl: (els.deezerUrl.value || "").trim(), spotifyId: "" });
    }

    const channels = [];
    if (els.chMeta.checked) channels.push({ key: "meta",   content: sanitizeSlug(els.metaContent.value) });
    if (els.chTikTok.checked) channels.push({ key: "tiktok", content: sanitizeSlug(els.ttContent.value) });
    if (els.chYouTube.checked) channels.push({ key: "youtube",content: sanitizeSlug(els.ytContent.value) });
    if (els.chIGDM.checked) channels.push({ key: "igdm",  content: sanitizeSlug(els.igdmContent.value) });

    const items = [];

    for (const dest of destinations) {
      for (const ch of channels) {
        const { utm_source, utm_medium } = buildUtmmedAndSource(ch.key);
        const utm_content = ch.content;

        let webUrl;
        try {
          webUrl = appendUtms(dest.baseUrl, { utm_source, utm_medium, utm_campaign, utm_content });
        } catch (e) {
          return { ok: false, error: `Invalid URL for destination "${dest.key}": ${dest.baseUrl}` };
        }

        const relPath = `tracks/${slug}/${dest.key}/${utm_content}.html`;
        const ogUrlAbs = `${repoBase}/${relPath}`;

        const html = generateHtml({
          title,
          siteName,
          description,
          ogUrlAbs,
          ogImageAbs,
          destType: dest.key === "spotify" ? "spotify" : "web",
          spotifyTrackId: dest.spotifyId,
          webUrl
        });

        items.push({
          relPath,
          pagesUrl: ogUrlAbs,
          dest: dest.key,
          utm_source, utm_medium, utm_campaign, utm_content,
          html
        });
      }
    }

    return { ok: true, slug, ogImageRel, ogImageAbs, items };
  }

  // ---------- GitHub API (create/update contents) ----------
  async function ghFetch(path, { method = "GET", token, body } = {}) {
    const res = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
    if (!res.ok) {
      const msg = json?.message || `${res.status} ${res.statusText}`;
      throw new Error(`${msg}`);
    }
    return json;
  }

  async function getFileSha({ owner, repo, path, branch, token }) {
    // If file doesn't exist, GitHub returns 404 -> we catch and return null
    try {
      const data = await ghFetch(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`, { token });
      return data?.sha || null;
    } catch (e) {
      if (String(e.message || "").includes("Not Found")) return null;
      throw e;
    }
  }

  async function putFile({ owner, repo, path, branch, token, message, contentBase64 }) {
    const sha = await getFileSha({ owner, repo, path, branch, token });
    const body = {
      message,
      content: contentBase64,
      branch
    };
    if (sha) body.sha = sha;

    // PUT create/update file contents
    return ghFetch(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
      method: "PUT",
      token,
      body
    });
  }

  // ---------- publish ----------
  async function publishAll() {
    clearLog();

    const v = validateOnly();
    if (!v.ok) return;

    const token = (els.ghToken.value || "").trim();
    if (!token) {
      addLogItem({ title: "Missing token", status: "FAIL", lines: ["Paste a fine-grained PAT in the token field (Contents: Read+Write)."] });
      return;
    }

    const batch = buildBatch();
    if (!batch || !batch.ok) {
      addLogItem({ title: "Batch build failed", status: "FAIL", lines: [batch?.error || "Unknown error"] });
      return;
    }

    addLogItem({
      title: "Publishing…",
      status: "RUNNING",
      lines: [
        `Target: ${OWNER}/${REPO} @ ${BRANCH}`,
        `OG image: ${batch.ogImageRel}`,
        `Files: ${batch.items.length}`
      ]
    });

    // 1) Publish OG image
    try {
      const ogJpgB64 = await canvasToJpegBase64(els.ogCanvas, 0.92);
      await putFile({
        owner: OWNER, repo: REPO, branch: BRANCH, token,
        path: batch.ogImageRel,
        message: `OG image: ${batch.slug}`,
        contentBase64: ogJpgB64
      });
      addLogItem({
        title: `OK: ${batch.ogImageRel}`,
        status: "PUBLISHED",
        linkText: "Open OG image",
        linkHref: batch.ogImageAbs,
        lines: [`Repo path: ${batch.ogImageRel}`]
      });
    } catch (e) {
      addLogItem({
        title: `FAIL: ${batch.ogImageRel}`,
        status: "ERROR",
        lines: [String(e.message || e)]
      });
      return;
    }

    let failures = 0;

    // 2) Publish HTML files sequentially (avoid conflicts)
    for (const it of batch.items) {
      try {
        const htmlB64 = utf8ToBase64(it.html);
        await putFile({
          owner: OWNER, repo: REPO, branch: BRANCH, token,
          path: it.relPath,
          message: `Redirect: ${batch.slug} (${it.dest}) ${it.utm_content}`,
          contentBase64: htmlB64
        });

        addLogItem({
          title: `OK: ${it.relPath}`,
          status: "PUBLISHED",
          linkText: "Open Pages URL",
          linkHref: it.pagesUrl,
          lines: [
            `Repo path: ${it.relPath}`,
            `dest=${it.dest} utm_source=${it.utm_source} utm_medium=${it.utm_medium} utm_content=${it.utm_content}`
          ]
        });
      } catch (e) {
        addLogItem({
          title: `FAIL: ${it.relPath}`,
          status: "ERROR",
          lines: [String(e.message || e)]
        });
        failures += 1;
        continue;
      }
    }

    if (failures > 0) {
      addLogItem({
        title: "DONE (with errors)",
        status: "PARTIAL",
        lines: [`${failures} of ${batch.items.length} HTML files failed. Check errors above.`]
      });
    } else {
      addLogItem({
        title: "DONE",
        status: "SUCCESS",
        lines: ["All files created/updated in GitHub. Give Pages a few seconds, then test the Pages URLs."]
      });
    }
  }

  // ---------- token check ----------
  async function checkToken() {
    clearLog();

    const token = (els.ghToken.value || "").trim();

    const errors = [];
    required("Token", token, errors);
    if (errors.length) {
      addLogItem({ title: "Check token", status: "FAIL", lines: errors });
      return;
    }

    addLogItem({ title: "Checking token…", status: "RUNNING", lines: [`${OWNER}/${REPO}`] });
    try {
      const repoInfo = await ghFetch(`/repos/${OWNER}/${REPO}`, { token });
      addLogItem({
        title: "Token OK",
        status: "PASS",
        lines: [
          `Default branch: ${repoInfo?.default_branch || "unknown"}`,
          `Permissions OK for Contents (expected Read/Write).`
        ]
      });
    } catch (e) {
      addLogItem({
        title: "Token check failed",
        status: "FAIL",
        lines: [String(e.message || e)]
      });
    }
  }

  // ---------- reset ----------
  function resetForm() {
    // Keep repoBase, siteName (stable)
    els.title.value = "";
    els.trackSlug.value = "";
    els.utmCampaign.value = "";

    els.destSpotify.checked = true;
    els.spotifyUrl.value = "";
    els.destApple.checked = false;
    els.appleUrl.value = "";
    els.destDeezer.checked = false;
    els.deezerUrl.value = "";

    els.chMeta.checked = true;
    els.metaContent.value = "meta-ads-story01";
    els.chTikTok.checked = true;
    els.ttContent.value = "tt-ads-infeed01";
    els.chYouTube.checked = true;
    els.ytContent.value = "yt-ads-instream01";
    els.chIGDM.checked = false;
    els.igdmContent.value = "ig-dm-v1";

    els.ogFile.value = "";
    els.ogFileInfo.textContent = "";
    ogImageLoaded = false;
    ogImageBitmap = null;
    drawOgCanvasFromBitmap();

    clearLog();
    els.validation.textContent = "";
    els.ogImageNamePreview.textContent = "";
  }

  function autoAlignCampaignToSlug() {
    const slug = sanitizeSlug(els.trackSlug.value);
    if (!els.utmCampaign.value.trim()) els.utmCampaign.value = slug;
    els.ogImageNamePreview.textContent = slug ? `assets/og/${slug}.jpg` : "";
  }

  // ---------- wire ----------
  function wire() {
    [
      els.repoBase, els.siteName,
      els.ghToken,
      els.title, els.trackSlug, els.utmCampaign,
      els.destSpotify, els.spotifyUrl, els.destApple, els.appleUrl, els.destDeezer, els.deezerUrl,
      els.chMeta, els.metaContent, els.chTikTok, els.ttContent, els.chYouTube, els.ytContent, els.chIGDM, els.igdmContent
    ].forEach(el => el.addEventListener("input", () => {
      if (el === els.trackSlug) autoAlignCampaignToSlug();
      validateOnly();
    }));

    els.trackSlug.addEventListener("input", autoAlignCampaignToSlug);

    els.ogFile.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      onOgFileSelected(file);
    });

    els.btnGenerate.addEventListener("click", () => {
      clearLog();
      const batch = buildBatch();
      if (!batch || !batch.ok) return;

      addLogItem({
        title: "Preview batch (not published)",
        status: "READY",
        lines: [
          `Will publish OG image: ${batch.ogImageRel}`,
          `Will publish ${batch.items.length} HTML files:`,
          ...batch.items.map(i => `- ${i.relPath} → ${i.pagesUrl}`)
        ]
      });
    });

    els.btnCheckToken.addEventListener("click", () => { checkToken(); });
    els.btnPublish.addEventListener("click", () => publishAll());
    els.btnReset.addEventListener("click", () => resetForm());

    drawOgCanvasFromBitmap();
    autoAlignCampaignToSlug();
    validateOnly();
  }

  wire();
})();
