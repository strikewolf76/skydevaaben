(function () {
  // New artist mapping and detection
  var ARTIST_MAP = {
    "Sky.AI": "https://open.spotify.com/artist/1cs70zffipwWQAyTsxLN31",
    "After Brügge": "https://open.spotify.com/artist/06E3D1UmG9DDDH3ooE6jLq",
    "Skydevaaben": "https://open.spotify.com/artist/3NqNiVvNvYg9j8wYSy6YQc"
  };
  var ARTIST_NAME = (document.title || "").split(" - ")[0].trim();
  var ARTIST_SPOTIFY_URL = ARTIST_MAP[ARTIST_NAME] || null;
  if (ARTIST_SPOTIFY_URL) {
    DESTINATIONS.push({
      key: "spotify_artist",
      baseUrl: ARTIST_SPOTIFY_URL,
      spotifyId: ""
    });
  }

  var params = new URLSearchParams(window.location.search || "");
  var CID = params.get("cid") || "";
  var TIKTOK_PIXEL_ID = "D6M222RC77U160FIC4CG";
  var consentGranted = false;
  var pixelEventsQueued = [];
  var pageViewFired = false;
  var tiktokPageViewFired = false;

  // Allow known social crawlers to fetch OG tags (no redirect)
  var ua = navigator.userAgent || "";
  var isCrawler = /(facebookexternalhit|facebot|TikTokbot|linkedinbot|discordbot|pinterest|slackbot|whatsapp|telegrambot|skypeuripreview)/i.test(ua);
  var isInAppBrowser = /(FBAN|FBAV|Instagram|Messenger|Line|TikTok)/i.test(ua);
  if (isCrawler) return;

  // Helper functions
  function hasConsent() {
    try {
      return localStorage.getItem("sv_cookie_consent") === "granted";
    } catch (_) {
      return false;
    }
  }

  function setConsentGranted() {
    if (consentGranted) return;
    consentGranted = true;
    try {
      localStorage.setItem("sv_cookie_consent", "granted");
    } catch (_) {}
    if (typeof window.fbq === "function" && META_PIXEL_ID) {
      fbq("consent", "grant");
    }
    if (typeof window.ttq === "object" && window.ttq && typeof window.ttq.grantConsent === "function") {
      try { window.ttq.grantConsent(); } catch (_) {}
    }
    while (pixelEventsQueued.length > 0) {
      var ev = pixelEventsQueued.shift();
      ev();
    }
  }

  function showConsentNoticeIfNeeded() {
    if (!hasConsent()) {
      var consentInfoEl = document.getElementById("consent-info");
      if (consentInfoEl) consentInfoEl.style.display = "block";
    }
  }

  function firePageViewOnce() {
    if (pageViewFired) return;
    if (typeof window.fbq !== "function" || !META_PIXEL_ID) return;
    pageViewFired = true;
    try { fbq("track", "PageView"); } catch (_) {}
  }

  function isTikTokCid() {
    if (!CID) return false;
    return /(^|[-_])tt([_-]|$)/i.test(CID);
  }

  function fireTikTokPageViewOnce() {
    if (tiktokPageViewFired) return;
    if (!isTikTokCid()) return;
    if (typeof window.ttq !== "object" || !window.ttq || typeof window.ttq.page !== "function") return;
    tiktokPageViewFired = true;
    try { window.ttq.page(); } catch (_) {}
  }

  // Show consent notice for new users
  showConsentNoticeIfNeeded();

  // Initialize Meta Pixel (if ID present)
  if (META_PIXEL_ID) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    fbq("init", META_PIXEL_ID);
    
    // If returning user: grant immediately and fire PageView
    if (hasConsent()) {
      setConsentGranted();
      firePageViewOnce();
    } else {
      // Queue PageView until consent granted
      pixelEventsQueued.push(function () { firePageViewOnce(); });
    }
  }

  if (TIKTOK_PIXEL_ID && isTikTokCid()) {
    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
      ttq.setAndDefer = function (target, method) {
        target[method] = function () {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (id) {
        var instance = ttq._i[id] || [];
        for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(instance, ttq.methods[n]);
        return instance;
      };
      ttq.load = function (id, cfg) {
        var src = "https://analytics.tiktok.com/i18n/pixel/events.js";
        var partner = cfg && cfg.partner;
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = src;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = cfg || {};
        var script = d.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = src + "?sdkid=" + id + "&lib=" + t;
        var firstScript = d.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      };
      ttq.load(TIKTOK_PIXEL_ID);
      if (typeof ttq.holdConsent === "function") ttq.holdConsent();
    })(window, document, "ttq");

    if (hasConsent()) {
      setConsentGranted();
      fireTikTokPageViewOnce();
    } else {
      pixelEventsQueued.push(function () { fireTikTokPageViewOnce(); });
    }
  }

  // New: Append follow CTA if artist URL exists
  if (ARTIST_SPOTIFY_URL) {
    var serviceButtons = document.querySelector('.service-buttons');
    var followDiv = document.createElement('div');
    followDiv.className = 'follow-cta-container';
    followDiv.innerHTML = `
      <button class="follow-btn"
              type="button"
              data-dest="spotify_artist"
              data-url="${ARTIST_SPOTIFY_URL}">
        <span class="spotify-logo">
          <svg width="34" height="34" viewBox="0 0 168 168"><circle fill="#1ED760" cx="84" cy="84" r="84"/><path d="M120.1 116.6c-1.7 2.8-5.3 3.7-8.1 2-22.2-13.6-50.2-16.7-83.2-9.2-3.2.7-6.4-1.3-7.1-4.5-.7-3.2 1.3-6.4 4.5-7.1 35.7-7.9 66.1-4.4 90.2 10.5 2.8 1.7 3.7 5.3 2 8.3zm11.5-23.1c-2.1 3.4-6.5 4.5-9.9 2.4-25.5-15.6-64.5-20.1-94.7-11.1-3.8 1.1-7.8-1.1-8.9-4.9-1.1-3.8 1.1-7.8 4.9-8.9 33.9-9.8 76.1-5 104.7 12.2 3.4 2.1 4.5 6.5 2.4 9.9zm12.7-25.2c-30.1-18.1-79.7-19.8-108.1-11.1-4.4 1.3-9-1.2-10.3-5.6-1.3-4.4 1.2-9 5.6-10.3 31.9-9.5 85.2-7.6 119.6 12.3 4 2.4 5.3 7.7 2.9 11.7-2.4 4-7.7 5.3-11.7 2.9z" fill="#fff"/></svg>
        </span>
        <span class="spotify-text follow-text">Follow ${ARTIST_NAME}</span>
      </button>
      <div class="follow-subline">If this found you… New drops go straight to Release Radar.</div>
    `;
    if (serviceButtons) { serviceButtons.appendChild(followDiv); }
  }

  function appendUtms(url, utms) {
    var u = new URL(url);
    Object.keys(utms).forEach(function(k) {
      if (utms[k]) u.searchParams.set(k, utms[k]);
    });
    return u.toString();
  }

  function fireOutboundSpotify(kind, destKey, dest) {
    if (typeof window.fbq !== "function" || !META_PIXEL_ID) return;
    try {
      var eventId = "ob_" + Date.now() + "_" + Math.random().toString(16).slice(2);
      fbq("trackCustom", "OutboundSpotify", {
        kind: kind,
        cid: CID || "",
        slug: TRACK_SLUG || "",
        dest: destKey === "spotify" ? "spotify" : destKey,
        channel: "meta",
        track_id: (dest && dest.spotifyId) ? dest.spotifyId : "",
        utm_campaign: UTM_CAMPAIGN || "",
        utm_content: (CID || UTM_CONTENT_DEFAULT || "")
      }, { eventID: eventId });
    } catch (_) {}
  }

  function handleClick(destKey, e) {
    // Finn URL fra DESTINATIONS, eller fra data-url på elementet (artist)
    var el = e && e.currentTarget ? e.currentTarget : null;
    var dataUrl = el ? el.getAttribute("data-url") : null;

    var dest = DESTINATIONS.find(d => d.key === destKey) || null;
    var baseUrl = (dest && dest.baseUrl) ? dest.baseUrl : dataUrl;

    if (!baseUrl) return;

    var webUrl = appendUtms(baseUrl, {
      utm_campaign: UTM_CAMPAIGN,
      utm_content: (CID || UTM_CONTENT_DEFAULT)
    });

    // Track alltid
    if (!hasConsent()) setConsentGranted();
    firePageViewOnce();
    fireOutboundSpotify("click", destKey, dest || { spotifyId: "" });



    // Normal click: vi styrer navigasjon for stabilitet (og for in-app)
    if (e) { e.preventDefault(); e.stopPropagation(); }

    if (isInAppBrowser) {
      window.location.href = webUrl;
      return;
    }

    setTimeout(function () {
      window.location.href = webUrl;
    }, 120);
  }

  // Attach click handlers
  document.querySelectorAll('[data-dest]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var destKey = this.getAttribute('data-dest');
      handleClick(destKey, e);
    });
  });

})();