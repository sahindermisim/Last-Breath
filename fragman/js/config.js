"use strict";
/* =========================================================================
   AYARLAR
   ========================================================================= */
const CONFIG = {
  duration: 133.5,
  assets: {
    logo:      ["assets/ashbound_logo.jpg"],    // giriş (0:00–0:08) — değiştirilmedi
    logoFinal: ["assets/ashbound_logo.png"],    // kapanış kartı, olduğu gibi
    gameLogo:  ["assets/last_breath_logo.png"], // varsa LAST BREATH kartında kullanılır
    music:     ["assets/music.mp3"],            // varsa sentez müziğin yerine geçer
    rating:    ["assets/rating_16.jpg"],        // yaş sınırı kartı (16+), kapanışın sonunda olduğu gibi
  },
  music: {
    startAt: 18.5,     // parçanın 0. saniyesi fragmanın kaçıncı saniyesinde başlar (zirve 60–85 → 1:18.5–1:43.5 patlama)
    cutAt: 103.5,      // ani sessizlik
    resumeAt: 118.5,   // kapanış darbesiyle müzik döner
    resumeFrom: 85,
    volume: 0.9,
    duck: 0.4,
  },
};

/* Replikler (İngilizce) — .srt dosyası da bundan üretilir. Seslendirme yok, yalnızca altyazı. */
const DIALOG = [
  { who: "NEWS ANCHOR", text: "…officials say the situation is under control.", a: 8.9, b: 11.9, kind: "tv" },
  { who: "NEWS ANCHOR", text: "Residents are urged to stay indoors…", a: 12.0, b: 14.7, kind: "tv" },
  { who: "RADIO", text: "…evacuation points… have fallen… I repeat…", a: 31.0, b: 34.0, kind: "radio" },
  { who: "ETHAN", text: "At first, I kept count. The days… the dead.", a: 35.6, b: 38.4 },
  { who: "ETHAN", text: "Then I stopped.", a: 40.1, b: 41.5 },
  { who: "SARAH", text: "Why are we still walking, Ethan?", a: 46.2, b: 48.8 },
  { who: "ETHAN", text: "Because if we stop… they win.", a: 52.0, b: 55.6 },
  { who: "SARAH", text: "How many are there?", a: 73.3, b: 75.1 },
  { who: "ETHAN", text: "Enough.", a: 76.7, b: 78.3 },
  { who: "SARAH", text: "Promise me… I won't become one of them.", a: 108.4, b: 112.3 },
  { who: "ETHAN", text: "…I promise.", a: 115.2, b: 117.2 },
];
