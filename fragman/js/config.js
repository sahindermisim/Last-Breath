"use strict";
/* =========================================================================
   AYARLAR
   ========================================================================= */
const CONFIG = {
  duration: 130.5,
  assets: {
    logo:      ["assets/ashbound_logo.jpg"],    // giriş (0:00–0:08) — değiştirilmedi
    logoFinal: ["assets/ashbound_logo.png"],    // kapanış kartı, olduğu gibi
    gameLogo:  ["assets/last_breath_logo.png"], // varsa LAST BREATH kartında kullanılır
    music:     ["assets/music.mp3"],            // varsa sentez müziğin yerine geçer
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

/* Replikler — .srt dosyası da bundan üretilir. Seslendirme yok, yalnızca altyazı. */
const DIALOG = [
  { who: "SPİKER", text: "…yetkililer durumun kontrol altında olduğunu açıkladı.", a: 8.9, b: 11.9, kind: "tv" },
  { who: "SPİKER", text: "Vatandaşların evlerinde kalması…", a: 12.0, b: 14.7, kind: "tv" },
  { who: "RADYO", text: "…tahliye noktaları… düştü… tekrar ediyorum…", a: 31.0, b: 34.0, kind: "radio" },
  { who: "ETHAN", text: "Başta sayıyordum. Günleri… ölüleri.", a: 35.6, b: 38.4 },
  { who: "ETHAN", text: "Sonra bıraktım.", a: 40.1, b: 41.5 },
  { who: "SARAH", text: "Neden hâlâ yürüyoruz, Ethan?", a: 46.2, b: 48.8 },
  { who: "ETHAN", text: "Çünkü durursak… onlar kazanır.", a: 52.0, b: 55.6 },
  { who: "SARAH", text: "Kaç tane var?", a: 73.3, b: 75.1 },
  { who: "ETHAN", text: "Yeterince.", a: 76.7, b: 78.3 },
  { who: "SARAH", text: "Söz ver bana… onlardan biri olmayacağım.", a: 108.4, b: 112.3 },
  { who: "ETHAN", text: "…Söz veriyorum.", a: 115.2, b: 117.2 },
];
