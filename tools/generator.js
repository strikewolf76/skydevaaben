(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    repoBase: $("repoBase"),
    siteName: $("siteName"),
    title: $("title"),
    description: $("description"),
    trackSlug: $("trackSlug"),
    utmCampaign: $("utmCampaign"),

    destSpotify: $("destSpotify"),
    spotifyId: $("spotifyId"),
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
    btnDownloadOg: $("btnDownloadOg"),
    ogImageNamePreview: $("ogImageNamePreview"),

    validation: $("validation"),
    log: $("log"),

    btnGenerate: $("btnGenerate"),
    btnReset: $("btnReset"),
  };

  // ---------- utils ----------
  function normBaseUrl(s) {
    return (s || "").trim().replace(/\/+$/, "");
  }

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
    // Locked presets
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

  function downloadTextFile(fileName, content) {
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
  }

  // ---------- OG image processing ----------
  let ogImageLoaded = false;
  let ogImageBitmap = null;

  function drawOgCanvasFromBitmap() {
    const canvas = els.ogCanvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!ogImageBitmap) {
      ctx.fillStyle = "rgba(127,127,127,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(127,127,127,0.7)";
      ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.fillText("Upload an image to generate 1200×630 OG image", 20, 40);
      return;
    }

    const targetW = 1200;
    const targetH = 630;
    const targetRatio = targetW / targetH;

    const srcW = ogImageBitmap.width;
    const srcH = ogImageBitmap.height;
    const srcRatio = srcW / srcH;

    let cropW, cropH, cropX, cropY;

    if (srcRatio > targetRatio) {
      cropH = srcH;
      cropW = Math.round(srcH * targetRatio);
      cropX = Math.round((srcW - cropW) / 2);
      cropY = 0;
    } else {
      cropW = srcW;
      cropH = Math.round(srcW / targetRatio);
      cropX = 0;
      cropY = Math.round((srcH - cropH) / 2);
    }

    ctx.drawImage(ogImageBitmap, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
  }

  async function onOgFileSelected(file) {
    ogImageLoaded = false;
    ogImageBitmap = null;

    if (!file) {
      els.ogFileInfo.textContent = "";
      drawOgCanvasFromBitmap();
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      ogImageBitmap = bitmap;
      ogImageLoaded = true;
      els.ogFileInfo.textContent = `Loaded: ${file.name} (${bitmap.width}×${bitmap.height})`;
      drawOgCanvasFromBitmap();
      validateOnly(); // update validation state
    } catch (e) {
      els.ogFileInfo.textContent = `Failed to read image: ${String(e)}`;
      ogImageLoaded = false;
      ogImageBitmap = null;
      drawOgCanvasFromBitmap();
      validateOnly();
    }
  }

  function downloadOgJpg(fileName) {
    const canvas = els.ogCanvas;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);
  }

  // ---------- HTML template generation ----------
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

    // If destination is not Spotify: no app-uri handoff; just go WEB_URL.
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

  <!-- Open Graph -->
  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="${htmlEscape(siteName)}">
  <meta property="og:title" content="${htmlEscape(title)}">
  <meta property="og:description" content="${htmlEscape(description)}">
  <meta property="og:url" content="${htmlEscape(ogUrlAbs)}">
  <meta property="og:image" content="${htmlEscape(ogImageAbs)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter fallback -->
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

    const title = (els.title.value || "").trim();
    const description = (els.description.value || "").trim();
    required("Title", title, errors);
    required("Description", description, errors);

    const slugRaw = (els.trackSlug.value || "");
    if (/_/.test(slugRaw)) errors.push("Track slug contains '_' (underscore). Use hyphens only.");
    const slug = sanitizeSlug(slugRaw);
    required("Track slug", slug, errors);

    const utmCampaign = sanitizeSlug(els.utmCampaign.value);
    required("utm_campaign", utmCampaign, errors);

    // Require at least one destination
    const anyDest = els.destSpotify.checked || els.destApple.checked || els.destDeezer.checked;
    if (!anyDest) errors.push("Select at least one destination.");

    // Dest validations
    if (els.destSpotify.checked) required("Spotify track ID", (els.spotifyId.value || "").trim(), errors);
    if (els.destApple.checked) required("Apple URL", (els.appleUrl.value || "").trim(), errors);
    if (els.destDeezer.checked) required("Deezer URL", (els.deezerUrl.value || "").trim(), errors);

    // Require at least one channel
    const anyCh = els.chMeta.checked || els.chTikTok.checked || els.chYouTube.checked || els.chIGDM.checked;
    if (!anyCh) errors.push("Select at least one channel.");

    // Per-channel utm_content
    if (els.chMeta.checked) required("utm_content (Meta)", els.metaContent.value, errors);
    if (els.chTikTok.checked) required("utm_content (TikTok)", els.ttContent.value, errors);
    if (els.chYouTube.checked) required("utm_content (YouTube)", els.ytContent.value, errors);
    if (els.chIGDM.checked) required("utm_content (IG DM)", els.igdmContent.value, errors);

    // Image required
    if (!ogImageLoaded) errors.push("OG image not uploaded yet (required).");

    if (errors.length) {
      els.validation.innerHTML = `<span class="bad">FAIL</span>\n` + errors.map(e => `- ${e}`).join("\n");
      return { ok: false, errors };
    }

    els.validation.innerHTML =
      `<span class="ok">OK</span>\n` +
      `- Output HTML → tracks/<slug>/<destination>/<utm_content>.html\n` +
      `- Output image → assets/og/<slug>.jpg\n` +
      `- OG uses absolute URLs (stable previews)\n`;

    // Update OG image name preview
    els.ogImageNamePreview.textContent = `${slug}.jpg`;

    return { ok: true };
  }

  function buildBatch() {
    const v = validateOnly();
    if (!v.ok) return null;

    const repoBase = normBaseUrl(els.repoBase.value);
    const siteName = (els.siteName.value || "").trim();
    const title = (els.title.value || "").trim();
    const description = (els.description.value || "").trim();

    const slug = sanitizeSlug(els.trackSlug.value);
    const utm_campaign = sanitizeSlug(els.utmCampaign.value);

    const ogImageRel = `assets/og/${slug}.jpg`;
    const ogImageAbs = `${repoBase}/${ogImageRel}`;

    const destinations = [];
    if (els.destSpotify.checked) {
      destinations.push({
        key: "spotify",
        type: "spotify",
        baseUrl: `https://open.spotify.com/track/${encodeURIComponent((els.spotifyId.value || "").trim())}`,
        spotifyId: (els.spotifyId.value || "").trim(),
      });
    }
    if (els.destApple.checked) {
      destinations.push({
        key: "apple",
        type: "web",
        baseUrl: (els.appleUrl.value || "").trim(),
        spotifyId: "",
      });
    }
    if (els.destDeezer.checked) {
      destinations.push({
        key: "deezer",
        type: "web",
        baseUrl: (els.deezerUrl.value || "").trim(),
        spotifyId: "",
      });
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

        // WEB_URL = destination base + UTM
        let webUrl;
        try {
          webUrl = appendUtms(dest.baseUrl, { utm_source, utm_medium, utm_campaign, utm_content });
        } catch (e) {
          // URL parsing failed
          return {
            ok: false,
            error: `Invalid URL for destination "${dest.key}": ${dest.baseUrl}`
          };
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
          ogImageRel,
          ogImageAbs,
          utm_source, utm_medium, utm_campaign, utm_content,
          dest: dest.key,
          html
        });
      }
    }

    return { ok: true, slug, ogImageRel, ogImageAbs, items };
  }

  function renderLog(batch) {
    els.log.innerHTML = "";

    batch.items.forEach((it) => {
      const div = document.createElement("div");
      div.className = "logitem";

      div.innerHTML = `
        <div class="top">
          <div>
            <div class="path">${it.relPath}</div>
            <div class="mono">dest: ${it.dest} | utm_source=${it.utm_source} | utm_medium=${it.utm_medium} | utm_content=${it.utm_content}</div>
          </div>
          <div class="mono">
            <a href="${it.pagesUrl}" target="_blank" rel="noreferrer">Open (Pages URL)</a>
          </div>
        </div>

        <div class="meta mono">
          <div>Upload HTML to: <strong>${it.relPath.replace(/\/[^/]+$/, "/")}</strong></div>
          <div>OG image required at: <strong>${batch.ogImageRel}</strong></div>
        </div>

        <div class="actions">
          <button data-action="download">Download HTML</button>
          <button data-action="copy">Copy HTML</button>
        </div>
      `;

      div.querySelector('[data-action="download"]').addEventListener("click", () => {
        const fileName = it.relPath.split("/").pop();
        downloadTextFile(fileName, it.html);
        alert(`Downloaded: ${fileName}\nUpload to: ${it.relPath}`);
      });

      div.querySelector('[data-action="copy"]').addEventListener("click", async () => {
        await copyToClipboard(it.html);
        alert(`Copied HTML.\nCreate file at: ${it.relPath}`);
      });

      els.log.appendChild(div);
    });

    // Top summary
    const summary = document.createElement("div");
    summary.className = "logitem";
    summary.innerHTML = `
      <div class="top">
        <div>
          <div class="path">Summary</div>
          <div class="mono">Created ${batch.items.length} HTML files under tracks/${batch.slug}/…</div>
        </div>
      </div>
      <div class="meta mono">
        <div>OG image: <strong>${batch.ogImageRel}</strong></div>
        <div>OG image absolute: <a href="${batch.ogImageAbs}" target="_blank" rel="noreferrer">${batch.ogImageAbs}</a></div>
      </div>
    `;
    els.log.prepend(summary);
  }

  function resetForm() {
    // Keep repoBase + siteName (usually stable)
    els.title.value = "";
    els.description.value = "Tap to open in Spotify.";
    els.trackSlug.value = "";
    els.utmCampaign.value = "";

    els.destSpotify.checked = true;
    els.spotifyId.value = "";
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

    // Clear image state
    els.ogFile.value = "";
    els.ogFileInfo.textContent = "";
    ogImageLoaded = false;
    ogImageBitmap = null;
    drawOgCanvasFromBitmap();

    // Clear log + validation
    els.log.innerHTML = "";
    els.validation.textContent = "";
    els.ogImageNamePreview.textContent = "";
  }

  function autoAlignCampaignToSlug() {
    const slug = sanitizeSlug(els.trackSlug.value);
    if (!els.utmCampaign.value.trim()) {
      els.utmCampaign.value = slug;
    }
    els.ogImageNamePreview.textContent = slug ? `${slug}.jpg` : "";
  }

  // ---------- wire ----------
  function wire() {
    // Inputs -> validate
    [
      els.repoBase, els.siteName, els.title, els.description,
      els.trackSlug, els.utmCampaign,
      els.destSpotify, els.spotifyId, els.destApple, els.appleUrl, els.destDeezer, els.deezerUrl,
      els.chMeta, els.metaContent, els.chTikTok, els.ttContent, els.chYouTube, els.ytContent, els.chIGDM, els.igdmContent
    ].forEach(el => el.addEventListener("input", () => {
      if (el === els.trackSlug) autoAlignCampaignToSlug();
      validateOnly();
    }));

    els.trackSlug.addEventListener("input", autoAlignCampaignToSlug);

    // Image upload
    els.ogFile.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      onOgFileSelected(file);
    });

    els.btnDownloadOg.addEventListener("click", () => {
      const ok = validateOnly().ok;
      if (!ok) return;
      const slug = sanitizeSlug(els.trackSlug.value);
      const name = `${slug}.jpg`;
      downloadOgJpg(name);
      alert(`Downloaded OG image: ${name}\nUpload to: assets/og/${name}`);
    });

    // Generate batch
    els.btnGenerate.addEventListener("click", () => {
      const batch = buildBatch();
      if (!batch) return;
      if (!batch.ok) {
        els.validation.innerHTML = `<span class="bad">FAIL</span>\n- ${batch.error}`;
        return;
      }
      renderLog(batch);
    });

    // Reset
    els.btnReset.addEventListener("click", () => resetForm());

    // Initial
    drawOgCanvasFromBitmap();
    autoAlignCampaignToSlug();
    validateOnly();
  }

  wire();
})();
