"use strict";
/* =========================================================================
   ZAMAN ÇİZELGESİ — 0:00–0:20 giriş (scenes.js, değiştirilmedi), sonrası film/shots.js
   ========================================================================= */
const INTRO = [[0, 8, sLogo, "Giriş · logo"], [8, 11.9, sRoom, "Giriş · oda"], [11.9, 20, sTV, "Giriş · TV"]];
function cineSubs(t) {
  if (t < 20) return subtitles(t); // giriş olduğu gibi
  const L = DIALOG.find(d => t >= d.a && t < d.b); if (!L) return;
  const k = Math.min(p(t, L.a, L.a + .35), 1 - p(t, L.b - .35, L.b));
  text(L.text, W / 2, H - BAR - 44, { size: 32, weight: 300, sp: .6, color: "#ffffff", alpha: k, blur: 5, dy: 1.5, shadow: "rgba(0,0,0,.95)", maxW: W - 400 });
}
function render(t) {
  STAND.clear();
  scr();
  let name;
  if (t < 20) {
    const sc = INTRO.find(s => t >= s[0] && t < s[1]);
    ctx.save(); sc[2](t); ctx.restore(); scr();
    ctx.drawImage(VIGNETTE, 0, 0);
    ctx.save(); ctx.globalAlpha = .08; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
    name = sc[3];
  } else name = F.render(t);
  scr();
  if (t < 118.5) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR); }
  cineSubs(t);
  if (t < 20) standTag();
  return name;
}
function buildCuts() {}
