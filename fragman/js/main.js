"use strict";
/* ---------- çevrimdışı render arayüzü (render.mjs kullanır) ---------- */
let WAV = null;
function encodeWav(buf) {
  const n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); out.setUint32(4, 36 + n * ch * 2, true); w(8, "WAVE"); w(12, "fmt "); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); w(36, "data"); out.setUint32(40, n * ch * 2, true);
  const chans = [...Array(ch)].map((_, i) => buf.getChannelData(i)); let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { out.setInt16(o, clamp(chans[c][i], -1, 1) * 32767, true); o += 2; }
  return new Uint8Array(out.buffer);
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`; };
  return DIALOG.map((d, i) => `${i + 1}\n${f(d.a)} --> ${f(d.b)}\n${d.who}: ${d.text}\n`).join("\n");
}
window.RENDER = {
  ready: null,
  frame(t) { render(t); return canvas.toDataURL("image/jpeg", .92); },
  async audio() {
    const sr = 48000, oc = new OfflineAudioContext(2, Math.ceil(sr * CONFIG.duration), sr);
    const mb = MUSIC_AB ? await oc.decodeAudioData(MUSIC_AB.slice(0)) : null;
    buildMix(oc, oc.destination, 0, 0, mb);
    WAV = encodeWav(await oc.startRendering());
    return Math.ceil(WAV.length / 2e6);
  },
  chunk(i) { const sub = WAV.subarray(i * 2e6, (i + 1) * 2e6); let s = ""; for (let k = 0; k < sub.length; k += 32768) s += String.fromCharCode.apply(null, sub.subarray(k, k + 32768)); return btoa(s); },
  srt, state: () => STATE, montage: () => F.cuts, dialog: () => DIALOG,
};

/* ---------- canlı önizleme ---------- */
let live = null, playing = false, T = 0, clock0 = 0, t0 = 0, liveMusic = null;
async function play(from) {
  if (!live) { live = new (window.AudioContext || window.webkitAudioContext)(); if (MUSIC_AB) liveMusic = await live.decodeAudioData(MUSIC_AB.slice(0)); }
  stop(); await live.resume();
  if (from >= CONFIG.duration - .05) from = 0;
  const dest = live.createGain(); dest.connect(live.destination); live._dest = dest;
  t0 = from; clock0 = live.currentTime + .08; buildMix(live, dest, from, clock0, liveMusic); playing = true; ui.play.textContent = "Duraklat";
}
function stop() { if (live && live._dest) { live._dest.disconnect(); live._dest = null; } playing = false; ui.play.textContent = "Sesli oynat"; }
const ui = { play: document.getElementById("play"), scrub: document.getElementById("scrub"), time: document.getElementById("time") };
function tick() {
  if (playing) { T = t0 + (live.currentTime - clock0); if (T >= CONFIG.duration) { T = CONFIG.duration; stop(); } }
  render(clamp(T, 0, CONFIG.duration - .001));
  ui.scrub.value = T; ui.time.textContent = `${Math.floor(T / 60)}:${(T % 60).toFixed(2).padStart(5, "0")}`;
  requestAnimationFrame(tick);
}
ui.play.addEventListener("click", () => playing ? stop() : play(T));
ui.scrub.addEventListener("input", () => { T = +ui.scrub.value; if (playing) play(T); });
document.addEventListener("keydown", e => { if (e.key === " ") { e.preventDefault(); playing ? stop() : play(T); } });

window.RENDER.ready = (async function boot() {
  makeFx();
  try { await Promise.all([`400 100px "Bebas Neue"`, `300 100px Oswald`, `400 100px Oswald`, `500 100px Oswald`, `600 100px Oswald`].map(f => document.fonts.load(f, "AŞİĞÜÖÇı"))); } catch (e) {}
  await loadAssets();
  document.getElementById("assets").innerHTML = Object.keys(CONFIG.assets).map(k => `<div><b>${ASSET_LABEL[k] || k}</b>${STATE[k] ? '<span class="ok">yüklendi</span>' : "eksik · yedek kullanılıyor"}</div>`).join("");
  makeSide(); GAME_TITLE = makeGameTitle(); F.bake(); F.bakeCrowd();
  let onsets = null; try { const r = await fetch("beats.json"); if (r.ok) onsets = (await r.json()).onsets; } catch (e) {}
  buildCuts(onsets); buildCues();
  const q = new URLSearchParams(location.search).get("t"); if (q) T = clamp(+q || 0, 0, CONFIG.duration);
  if (!RENDER_MODE) requestAnimationFrame(tick);
  return true;
})();
