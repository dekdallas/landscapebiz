import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.replace('screenshot-', '').replace(/(-.*)?\.png$/, ''))).filter(n => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const filepath = path.join(dir, filename);

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/dekka/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });

// Force all scroll-animated elements visible for full-page capture
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
});
// Wait for CSS transitions to complete (0.6s transition + buffer)
await new Promise(r => setTimeout(r, 800));

await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${filepath}`);
