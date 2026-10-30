// Renders scene.html frame by frame and encodes the homepage promo video:
// public/video/trustlio-home-promo.mp4 plus a poster image. H.264 plays
// everywhere, and for flat animation it came out smaller than VP9.
//
//   node scripts/promo-video/render.mjs            full render
//   node scripts/promo-video/render.mjs --stills   a few frames, for checking
//
// Needs Playwright (with Chromium) and ffmpeg (with libx264 and libwebp). Neither is a project dependency: this runs only when the video
// changes, and the output is committed.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

// require() so a global Playwright install (found through NODE_PATH) works too.
const { chromium } = createRequire(import.meta.url)("playwright");

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../public/video");
const FPS = 30;
const POSTER_AT = 13.9; // seconds: the logo, URL and tagline are all on screen
const stills = process.argv.includes("--stills");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(pathToFileURL(join(here, "scene.html")).href);
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.DURATION);

const frame = async (t, path) => {
  await page.evaluate((t) => window.render(t), t);
  await page.screenshot({ path });
};

if (stills) {
  const dir = join(here, "stills");
  mkdirSync(dir, { recursive: true });
  for (const t of [1.6, 2.9, 4.2, 4.6, 6.0, 8.0, 10.6, 12.8, 13.9]) {
    await frame(t, join(dir, `t${t.toFixed(1)}.png`));
  }
  await browser.close();
  console.log(`Stills in ${dir}`);
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), "promo-"));
const frames = Math.round(duration * FPS);
for (let i = 0; i < frames; i++) {
  await frame(i / FPS, join(tmp, `f${String(i).padStart(4, "0")}.png`));
}
await frame(POSTER_AT, join(tmp, "poster.png"));
await browser.close();

mkdirSync(outDir, { recursive: true });
const input = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(tmp, "f%04d.png")];
const ffmpeg = (...args) => execFileSync("ffmpeg", args, { stdio: "inherit" });

ffmpeg(...input, "-c:v", "libx264", "-crf", "28", "-preset", "veryslow", "-tune", "animation",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", join(outDir, "trustlio-home-promo.mp4"));
ffmpeg("-y", "-loglevel", "error", "-i", join(tmp, "poster.png"), "-c:v", "libwebp", "-quality", "82",
  join(outDir, "trustlio-home-promo-poster.webp"));
rmSync(tmp, { recursive: true });

for (const f of ["trustlio-home-promo.mp4", "trustlio-home-promo-poster.webp"]) {
  console.log(`${f}: ${(statSync(join(outDir, f)).size / 1024).toFixed(0)} KB`);
}
