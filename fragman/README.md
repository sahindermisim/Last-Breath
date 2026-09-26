# LAST BREATH — Sinematik Duyuru Fragmanı

1:50'lik sinematik duyuru fragmanı. Oynanış görüntüsü içermiyor.
Çıktı 1920×1080, 30 fps (60 da olur), MP4 (H.264 + AAC). Fragman boyunca 2.39:1 sinema bantları var; yalnızca kapanıştaki logo ve "YAKINDA" kartları tam ekran.

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Önizleme oynatıcısı; modülleri yükler. |
| `js/config.js` | Dosya yolları, renk eşitleme ayarları, replikler ve zamanlamaları. |
| `js/scenes.js` | Giriş (0:00–0:20): logo, oda, TV, "İKİ HAFTA SONRA". Bu bölüm değiştirilmedi. |
| `js/cinema.js` | 0:20 sonrası: renk eşitleme, kare animasyonu, bölümler, kapanış. |
| `js/audio.js` | Ses tasarımı ve mix. |
| `js/side.js`, `js/core.js` | Yardımcılar (girişteki oda sahnesi, yazı, logo, yağmur, sis). |
| `render.mjs` | Kareleri tek tek alır, ffmpeg ile MP4'e çevirir, sesi mix'ler, `.srt` yazar. |
| `trailer.srt` | Tüm replikler ve zamanlamaları. |
| `assets/kareler/` | kare01–kare13, ekstra01: 0:20'den sonra kullanılan tek görüntüler. |

## Akış

| Zaman | Bölüm | Görüntü |
|---|---|---|
| 0:00–0:20 | Giriş | Ashbound logosu, oda, TV, "İKİ HAFTA SONRA" (değiştirilmedi) |
| 0:20–0:38 | Sessiz dünya | kare01 (yangına yavaş yakınlaşma) → ekstra01 → kare02 (radyo LED'i yanıp söner, cızırtı kesilince söner) → kare03 |
| 0:38–0:49 | Sarah | kare04: ateş titrer, kıvılcımlar yükselir, bulutlar kayar |
| 0:49–1:05 | Yükseliş | Kalp atışı hızlanır. kare01'den karartılmış kare05'e çapraz geçiş → "DÜNYA SUSTU." · "ÖLÜLER SUSMADI." → kare06 + sürgü sesi |
| 1:05–1:27 | Patlama | kare11 (namlu alevinde beyaz flaş) → kare13 (sarsıntı) → kare07 (ağır çekim) → kare12 (hızlı kayma) → kare08 (sert sarsıntı, 1:25.5'te doruk flaşı). Kesmeler 120 BPM vuruşlarında, aralarında 2–3 karelik siyah flaş. |
| 1:27–1:40.5 | Ani sessizlik | Siyah ekran ve nefes → kare09 → 3 sn sessizlik → kare10 |
| 1:40.5–1:50 | Kapanış | Darbe → LAST BREATH / "SON NEFESİNE KADAR." → ASHBOUND logosu → "YAKINDA" / "Sinematik fragman. Oyun içi görüntü değildir." → uzakta hırıltı, kararma |

## Renk eşitleme

Her kare yüklenirken aynı tona çekilir: tüm renkler soğuk mavi-griye iner, yalnızca ateş turuncusu korunur.
Parlaklık kareler arasında eşitlenir. Karelere özel ayarlar `js/config.js` → `grade` içinde:
kare12 daha karanlık ve turuncusu azaltılmış (`exp: .62, warm: .55`), kare05 kare01'in ışığına uyacak kadar karartılmış (`exp: .72`).
Ateş bölgelerinden bir maske çıkarılır; titreme bu maske üzerinden verilir, yani yalnızca karedeki ateşler titrer.

## Üretme

```bash
pip install imageio-ffmpeg          # H.264/AAC destekli ffmpeg (sistemde varsa gerekmez)
cd fragman
node render.mjs                     # → cikti/trailer.mp4 + cikti/trailer.srt
node render.mjs --fps=60            # 60 fps
node render.mjs --from=65 --to=87   # yalnızca bir aralık
node render.mjs --audio-only        # yalnızca sesi yeniden mix'leyip mevcut videoya koyar
```

Playwright'ın Chromium'u gerekli. Önizleme için: `python3 -m http.server` → `http://localhost:8000/index.html`
(boşluk tuşu oynatır; `?t=65` o saniyeden açar).

## Ses

- Seslendirme yok, yalnızca altyazı. Bu ortamda doğal Türkçe TTS yok; robotik ses kullanılmadı.
- Müzik dosyası verilmediği için ritim ve altyapı sentezleniyor: kalp atışı, davul, "braam" vuruşları, pad. Başka bir parça kullanılmıyor.
- `assets/music.mp3` eklenirse sentez ritmin yerine o çalar. En güçlü kısmı 1:05–1:27'ye denk gelir (`music.startAt`).
  Konuşma anlarında müzik %40'a iner ve kesmeler parçanın vuruşlarına oturtulur.

## Eksik

- Ayrı bir LAST BREATH logo dosyası verilmedi; kapanıştaki başlık Bebas Neue ile yazılıyor.
  `assets/last_breath_logo.png` eklenirse otomatik olarak o kullanılır.
