# LAST BREATH — Sinematik Duyuru Fragmanı

2:10'luk sinematik duyuru fragmanı. Fotoğraf ya da hazır görsel kullanılmıyor: 0:20'den sonraki her şey (şehir, karakterler, zombiler, ışık, yağmur, sis) kodla çiziliyor.
Oynanış görüntüsü, arayüz ya da özellik yazısı yok. Çıktı 1920×1080, 30 fps, MP4 (H.264 + AAC).
Fragman boyunca 2.39:1 sinema bantları var; yalnızca kapanıştaki logo ve "YAKINDA" kartları tam ekran.

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Önizleme oynatıcısı; modülleri yükler. |
| `js/config.js` | Dosya yolları, müzik ayarları, replikler ve zamanlamaları. |
| `js/scenes.js`, `js/side.js` | Giriş (0:00–0:20): Ashbound logosu, oda, TV, "İKİ HAFTA SONRA". Değiştirilmedi. |
| `js/film/rig.js` | Siluet iskeleti: Ethan, Sarah, zombiler, Tank. Anatomik parçalar tek bir maskede birleşir; kenar ışığı ve hale bu maskeden çıkar. |
| `js/film/world.js` | Perspektif kamera, 5 katmanlı yıkık şehir, gökyüzü, ateş, duman, sis, yağmur, kül, yansıma, post (bloom, renk kayması, grenk, vinyet). |
| `js/film/shots.js` | 0:20 sonrası tüm çekimler ve kurgu. |
| `js/film/timeline.js` | Giriş ile yeni bölümü birleştirir, altyazıları ve sinema bantlarını çizer. |
| `js/audio.js` | Ses tasarımı, sentez müzik ve mix. |
| `render.mjs` | Kareleri tek tek alır, ffmpeg ile MP4'e çevirir, sesi mix'ler, `.srt` yazar. |
| `trailer.srt` | Tüm replikler ve zamanlamaları. |
| `dev/` | İskeleti tek başına incelemek için test sayfaları (rig, kafa, önden görünüş). |

## Akış

| Zaman | Bölüm | Görüntü |
|---|---|---|
| 0:00–0:20 | Giriş | Değiştirilmedi |
| 0:20–0:41.5 | Sessiz dünya | Yıkık şehrin üstünden geçiş, ufukta büyük yangın → kablodan sallanan trafik lambası son kez yanıp söner → bozuk radyo, cızırtı kesilince kırmızı ışık söner → Ethan sırtı dönük, yağmurda şehre bakıyor |
| 0:41.5–0:56.5 | Ateş başı | Çatıda kamp ateşi, iki siluet, kıvılcımlar, uzakta yangınlar |
| 0:56.5–1:18.5 | Yükseliş | Kalp atışı hızlanır. Sisten önce bir, sonra beş, sonra yüzlerce zombi; arkada yanan araba. "DÜNYA SUSTU." · "ÖLÜLER SUSMADI." → karanlık, sürgü sesi, tek namlu alevi Ethan'ı aydınlatır |
| 1:18.5–1:43.5 | Patlama | Namlu alevleriyle her seferinde daha yakın sürü → şimşekte ağır çekim pala → tahtalı pencereden uzanan eller → yanan sokakta kaçış → Tank yanan arabanın üstüne atlar, kükrer. Kesmeler vuruşlarda, aralarda 2–3 karelik siyah/beyaz flaş |
| 1:43.5–1:58.5 | Ani sessizlik | Siyah, yalnızca nefes → yüz yüze iki profil, aralarında küçük ateş → ateş söner |
| 1:58.5–2:10.5 | Kapanış | Darbe → LAST BREATH / "SON NEFESİNE KADAR." → Ashbound logosu → "YAKINDA" → uzakta tek zombi hırıltısı, kararma |

## Görsel dil

- Karakterler ve zombiler yalnızca siluet: ateş, şimşek, sis ya da namlu alevi arkadan aydınlatır. Yüz ayrıntısı yok.
- Sıcak renk yalnızca ateş turuncusu (`#ff7a2a`); geri kalan her şey soğuk mavi-gri ve siyah.
- Her karede katmanlı yağmur, sis, kül ve kıvılcım, film grengi, vinyet, hafif renk kayması. Kamera hiç durmaz; aksiyonda sert sarsıntı.
- Sürü, önceden çizilmiş yürüme karelerinden (farklı boy ve duruşlarda 19 varyant) oluşur, böylece yüzlerce zombi akıcı çizilir.

## Üretme

```bash
pip install imageio-ffmpeg          # H.264/AAC destekli ffmpeg (sistemde varsa gerekmez)
cd fragman
node render.mjs                     # → cikti/trailer.mp4 + cikti/trailer.srt
node render.mjs --from=78 --to=104  # yalnızca bir aralık
node render.mjs --audio-only        # yalnızca sesi yeniden mix'leyip mevcut videoya koyar
```

Playwright'ın Chromium'u gerekli. Önizleme için: `python3 -m http.server` → `http://localhost:8000/index.html`
(boşluk tuşu oynatır; `?t=78` o saniyeden açar).

## Ses

- Seslendirme yok, yalnızca altyazı (robotik ses kullanılmadı).
- Katmanlı efektler kodla sentezleniyor: yağmur, rüzgâr, radyo cızırtısı, ateş çıtırtısı, kalp atışı, sürgü, silah, pala, cam/tahta kırılması, Tank kükremesi, derin darbeler.
- Müzik dosyası verilmediği için ritim ve altyapı da sentezleniyor. `assets/music.mp3` eklenirse o çalar:
  sessiz kısımlarda kısık, patlamada tam, ani sessizlikte tamamen kesilir, kapanışta geri gelir (`js/config.js` → `music`).
  Parçanın vuruşları otomatik bulunur ve patlamadaki kesmeler o vuruşlara oturtulur.

## Eksik

- Ayrı bir LAST BREATH logo dosyası verilmedi; kapanıştaki başlık Bebas Neue ile yazılıyor.
  `assets/last_breath_logo.png` eklenirse otomatik olarak o kullanılır.
