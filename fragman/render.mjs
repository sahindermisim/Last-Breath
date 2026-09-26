// LAST BREATH fragmanını MP4 olarak üretir.
//   node render.mjs                     → cikti/trailer.mp4 (1920x1080, 30 fps) + cikti/trailer.srt
//   node render.mjs --fps=60            → 60 fps
//   node render.mjs --from=60 --to=75   → yalnızca bir aralık (hızlı kontrol)
//   node render.mjs --workers=4         → paralel sekme sayısı
//   node render.mjs --audio-only        → yalnızca sesi yeniden mix'leyip mevcut cikti/trailer.mp4'e yerleştirir
// Gerekenler: Node 18+, Playwright (Chromium), H.264/AAC destekli ffmpeg (FFMPEG ortam değişkeniyle de verilebilir).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn, execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? "1"]));
const FPS = +(args.fps || 30), WORKERS = +(args.workers || 3), OUT = path.resolve(ROOT, args.out || "cikti");
fs.mkdirSync(OUT, { recursive: true });

async function loadPlaywright() {
  try { return await import("playwright"); } catch (e) {}
  const g = execSync("npm root -g").toString().trim();
  return await import(pathToFileURL(path.join(g, "playwright", "index.mjs")).href);
}
function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { execSync("ffmpeg -hide_banner -encoders | grep -q libx264", { stdio: "ignore", shell: "/bin/bash" }); return "ffmpeg"; } catch (e) {}
  try { return execSync(`python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"`).toString().trim(); } catch (e) {}
  throw new Error("H.264 destekli ffmpeg bulunamadı. `pip install imageio-ffmpeg` ya da FFMPEG=/yol/ffmpeg");
}
const FF = findFfmpeg();
const run = (cmd, a, input) => new Promise((res, rej) => {
  const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "pipe", "pipe"] }); const out = []; let err = "";
  p.stdout.on("data", d => out.push(d)); p.stderr.on("data", d => err += d);
  p.on("close", c => c === 0 ? res(Buffer.concat(out)) : rej(new Error(err.slice(-2000))));
});

// ---------- müzik vuruşları → beats.json ----------
async function detectBeats() {
  const src = ["assets/music.mp3"].map(f => path.join(ROOT, f)).find(fs.existsSync);
  const bj = path.join(ROOT, "beats.json");
  if (!src) { if (fs.existsSync(bj)) fs.unlinkSync(bj); console.log("müzik yok → montaj sabit 0.62 sn aralıkla kesiliyor"); return; }
  const cfg = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/startAt:\s*([\d.]+)/);
  const startAt = cfg ? +cfg[1] : 5, SR = 22050, HOP = 512;
  const raw = await run(FF, ["-v", "error", "-i", src, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"]);
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const e = []; let prev = 0;
  for (let i = 0; i + HOP < x.length; i += HOP) { let s = 0; for (let k = 0; k < HOP; k++) { const hp = x[i + k] - prev * .97; prev = x[i + k]; s += hp * hp; } e.push(Math.log(1e-9 + s)); }
  const flux = e.map((v, i) => Math.max(0, v - (i >= 4 ? (e[i - 1] + e[i - 2] + e[i - 3] + e[i - 4]) / 4 : v)));
  const W = Math.round(1.5 * SR / HOP), onsets = [];
  for (let i = 3; i < flux.length - 3; i++) {
    const lo = Math.max(0, i - W), hi = Math.min(flux.length, i + W), seg = flux.slice(lo, hi);
    const m = seg.reduce((a, b) => a + b, 0) / seg.length, sd = Math.sqrt(seg.reduce((a, b) => a + (b - m) ** 2, 0) / seg.length);
    if (flux[i] > m + sd && flux[i] >= Math.max(...flux.slice(i - 3, i + 4))) onsets.push(+(i * HOP / SR + startAt).toFixed(3));
  }
  fs.writeFileSync(bj, JSON.stringify({ source: path.basename(src), startAt, onsets }, null, 0));
  console.log(`vuruşlar: ${onsets.filter(o => o > 65 && o < 90).length} tanesi montaj aralığında`);
}

// ---------- statik sunucu ----------
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".wav": "audio/wav" };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});

await detectBeats();
await new Promise(r => server.listen(0, r));
const URLP = `http://127.0.0.1:${server.address().port}/index.html?render=1`;
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const open = async () => { const pg = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); pg.on("pageerror", e => console.error("sayfa hatası:", e.message)); await pg.goto(URLP); await pg.evaluate(() => window.RENDER.ready); return pg; };

const main = await open();
const duration = await main.evaluate(() => CONFIG.duration);
const T0 = +(args.from || 0), T1 = Math.min(duration, +(args.to || duration));
console.log("varlıklar:", JSON.stringify(await main.evaluate(() => RENDER.state())));

// ---------- ses ----------
console.log("ses mix'leniyor…");
const nChunks = await main.evaluate(() => RENDER.audio());
const parts = []; for (let i = 0; i < nChunks; i++) parts.push(Buffer.from(await main.evaluate(i => RENDER.chunk(i), i), "base64"));
const wavPath = path.join(OUT, "audio.wav"); fs.writeFileSync(wavPath, Buffer.concat(parts));
fs.writeFileSync(path.join(OUT, "trailer.srt"), await main.evaluate(() => RENDER.srt()));
fs.writeFileSync(path.join(OUT, "montaj.json"), JSON.stringify(await main.evaluate(() => RENDER.montage()), null, 1));

if (args["audio-only"]) {
  const mp4 = path.join(OUT, "trailer.mp4"), tmp = path.join(OUT, "trailer_tmp.mp4");
  await run(FF, ["-y", "-v", "error", "-i", mp4, "-i", wavPath, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", tmp]);
  fs.renameSync(tmp, mp4); await browser.close(); server.close(); console.log("ses güncellendi: " + mp4); process.exit(0);
}

// ---------- görüntü ----------
const total = Math.round((T1 - T0) * FPS), per = Math.ceil(total / WORKERS);
let done = 0; const t_start = Date.now();
async function worker(w) {
  const a = w * per, b = Math.min(total, a + per); if (a >= b) return null;
  const pg = w === 0 ? main : await open(), seg = path.join(OUT, `seg${w}.mp4`);
  const ff = spawn(FF, ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), seg], { stdio: ["pipe", "ignore", "inherit"] });
  const closed = new Promise(r => ff.on("close", r));
  for (let i = a; i < b; i++) {
    const url = await pg.evaluate(t => RENDER.frame(t), T0 + i / FPS);
    if (!ff.stdin.write(Buffer.from(url.slice(url.indexOf(",") + 1), "base64"))) await new Promise(r => ff.stdin.once("drain", r));
    if (++done % 150 === 0) { const el = (Date.now() - t_start) / 1000; console.log(`kare ${done}/${total} · kalan ~${Math.round(el / done * (total - done))} sn`); }
  }
  ff.stdin.end(); await closed; return seg;
}
const segs = (await Promise.all([...Array(WORKERS)].map((_, w) => worker(w)))).filter(Boolean);
await browser.close(); server.close();

// ---------- birleştir ----------
const list = path.join(OUT, "segs.txt"); fs.writeFileSync(list, segs.map(s => `file '${s}'`).join("\n"));
const name = args.from || args.to ? `trailer_${T0}-${T1}.mp4` : "trailer.mp4";
await run(FF, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-ss", String(T0), "-t", String(T1 - T0), "-i", wavPath, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", path.join(OUT, name)]);
for (const s of [...segs, list]) fs.unlinkSync(s);
console.log(`hazır: ${path.join(OUT, name)} (${((Date.now() - t_start) / 1000).toFixed(0)} sn)`);
