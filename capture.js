const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // renders onto the Xvfb virtual display set via $DISPLAY
    args: [
      '--start-fullscreen',
      '--window-size=1920,1080',
      '--kiosk',
      '--no-sandbox',
    ],
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  // broadcast.html is a fixed 1920x1080 layout purpose-built for streaming —
  // no scrolling, cam feed dominant. index.html is the separate scrollable
  // dashboard for people visiting the GitHub Pages site in a browser.
  const filePath = 'file://' + path.resolve(__dirname, 'broadcast.html');
  await page.goto(filePath, { waitUntil: 'networkidle2' });

  // keep the process alive; ffmpeg is grabbing this browser window
  await new Promise(() => {});
})();
