# 🌋 Volcano Monitor 24/7

Live global volcano dashboard built on NASA's public EONET event feed, with a map,
an auto-refreshing field log, and links to real observatory webcams (USGS HVO,
INGV Etna, Icelandic Met Office, USGS CVO).

## What's in here

There are **two separate pages** because a browsable website and a video feed
have different jobs:

- `index.html` — the interactive dashboard people browse on GitHub Pages.
  Scrolls, has clickable webcam links, a bigger field log. Pulls live data
  client-side from `https://eonet.gsfc.nasa.gov/api/v3/events?category=volcanoes`
  (public, no API key needed) and refreshes every 5 minutes.
- `broadcast.html` — a **fixed 1920×1080 frame, no scrolling**, purpose-built
  for the YouTube stream. Live cam feed dominates the left ~68% of the frame;
  the right sidebar has a stat strip, a small static map, and an
  auto-scrolling field-log marquee; a news-style ticker runs across the
  bottom. This is what `capture.js` loads for streaming.
- `.github/workflows/deploy-pages.yml` — deploys `index.html` (the browsable
  site) to GitHub Pages on every push, and redeploys every 6h to keep it warm.
  **This part works great on free GitHub Actions.**
- `.github/workflows/stream-to-youtube.yml` + `capture.js` — renders
  `broadcast.html` in headless Chromium at 1920×1080 and pushes it to YouTube
  over RTMP using ffmpeg. **Read the caveat below before relying on this.**

## Setup

1. Push this repo to GitHub.
2. Settings → Pages → set source to "GitHub Actions". Your dashboard will be
   live at `https://<you>.github.io/<repo>/` within a few minutes.
3. For streaming: create a YouTube Live stream key (YouTube Studio → Go Live →
   Stream), then add it as a repo secret named `YOUTUBE_STREAM_KEY`
   (Settings → Secrets and variables → Actions).

## The honest limitation: GitHub Actions ≠ a 24/7 streaming server

Hosted GitHub Actions runners are **killed after 6 hours**, and Actions in
general isn't designed to run persistent background processes — it's designed
for finite jobs. The `stream-to-youtube.yml` workflow works around this by
restarting itself roughly every 5h50m, but each restart means:

- ~30-90 seconds of dropped stream while a new runner boots and reconnects
- YouTube's dashboard will log the stream going offline and back online
- On a busy Actions queue, a restart can occasionally be delayed a few minutes

If you need a genuinely gapless 24/7 broadcast, the honest fix is to run the
same `ffmpeg` + headless-Chromium loop on a small **always-on VPS** (a $4-6/mo
box from Hetzner, DigitalOcean, or similar works fine) instead of on Actions.
You can still use this repo's `deploy-pages.yml` to keep your data/dashboard
auto-updating — just point the VPS's Chromium at your GitHub Pages URL instead
of the local file.

## Data & attribution

- Event data: NASA EONET (Earth Observatory Natural Event Tracker) — public
  domain, no key required.
- Webcams: linked out (not embedded) to each observatory's own live page,
  since most don't allow iframe embedding or hotlinking of their streams.
