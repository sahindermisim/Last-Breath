# LAST BREATH — Oyun Fragmanı (v2)

Brifing v2'ye göre hazırlanmış 2:00'lik hikâye fragmanı: 1920×1080, 30 fps (60 da olur), MP4 (H.264 + AAC), 2.39:1 letterbox.

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Fragmanın kendisi. Her kare yalnızca zamana bağlı, canvas'ta çiziliyor. Tarayıcıda açınca önizleme oynatıcısı var. |
| `render.mjs` | Kareleri tek tek alıp ffmpeg ile MP4'e çeviriyor, sesi ayrıca mix'liyor, `.srt` yazıyor. |
| `trailer.srt` | Tüm replikler ve zamanlamaları. |
| `assets/` | Senin dosyaların (aşağıya bak). |
| `fonts/` | Bebas Neue ve Oswald (Google Fonts, OFL lisanslı; Türkçe karakterler dahil). |

## Dosyaları koyma

```
fragman/assets/ashbound_logo.png   (ya da .jpg; şu an senin gönderdiğin .jpg duruyor)
fragman/assets/key_art.jpg
fragman/assets/last_breath_logo.png   (isteğe bağlı: ayrı oyun logosu)
fragman/assets/music.mp3
fragman/assets/sprites/ethan.png, sarah.png, zombie_normal.png, runner.png, tank.png, armored.png
```

Eksik bir dosyanın yerine yedek çizim kullanılır ve o karenin sağ üst köşesinde
**"YER TUTUCU · … bekleniyor"** yazar. Tüm dosyalar yerindeyse bu yazı kendiliğinden kaybolur.

`index.html` başındaki `CONFIG` bölümünde ayarlanabilenler:

- `keyArt.focus`: kapak görselindeki Ken Burns yakınlaşmasının merkezi (0–1 arası, x ve y).
- `keyArt.ethanFocus`: 1:30'daki yakın plan için Ethan'ın yüzünün kapak görselindeki yeri.
- `keyArt.titleCrop`: ayrı bir LAST BREATH logosu yoksa, kapaktaki yazının kırpılacağı dikdörtgen `[x, y, genişlik, yükseklik]` (0–1 arası).
- `spriteFacing`: sprite'lar görselde yukarı bakıyorsa `-Math.PI/2` (varsayılan), sağa bakıyorsa `0`.
- `music.startAt`: parçanın 0. saniyesinin fragmandaki yeri. Varsayılan 5, böylece parçanın 60–85. saniyelerindeki zirve 1:05–1:30 montajına denk gelir.

## Üretme

```bash
pip install imageio-ffmpeg          # H.264/AAC destekli ffmpeg (sistemde varsa gerekmez)
cd fragman
node render.mjs                     # → cikti/trailer.mp4 + cikti/trailer.srt
node render.mjs --fps=60            # 60 fps
node render.mjs --from=65 --to=90   # yalnızca montajı üret (hızlı kontrol)
```

Playwright'ın Chromium'u gerekli. 4 çekirdekli bir makinede 30 fps tam render yaklaşık 5–6 dakika sürüyor.
Önizleme için: `python3 -m http.server` → `http://localhost:8000/index.html`
(boşluk tuşu oynatır; `?t=65` o saniyeden açar).

## Nasıl üretildi

- **Görüntü:** Her sahne `index.html` içinde 2D canvas'a çiziliyor: kamera hareketi, ışık ve gölge katmanı,
  yağmur, sis ve kıvılcım parçacıkları, film greni, vinyet, letterbox. Görseller sabit olduğu için hareketi bu katmanlar veriyor
  (Ken Burns, sarsıntı, projektör süpürmesi, flaşlar).
- **Ashbound logosu:** Senin dosyan. Yeniden çizilmedi. Siyah zemin saydamlığa çevrildi, beyaz renk ve oranlar aynen korundu.
  Açılışta bulanıktan netleşiyor, üzerinden metalik bir ışık bandı geçiyor. Kapanışta küçük olarak tekrar geliyor.
- **Ses:** Web Audio `OfflineAudioContext` ile tek geçişte mix'leniyor: uğultu, yağmur, rüzgâr, uzak siren, jeneratör uğultusu,
  TV paraziti, silah, patlama, hırıltı, darbe, nefes ve yankı. Müzik, konuşma anlarında %40'a iniyor.
  1:30'da müzik kesiliyor, 1:39–1:41 arası tam sessizlik var, ardından darbe geliyor.
- **Montaj senkronu:** `music.mp3` varsa `render.mjs` parçadaki vuruşları çıkarıyor (enerji artışı tespiti, `beats.json`).
  1:05–1:30 arasındaki kesmeler bu vuruşlara oturtuluyor; planlar 0.4–0.85 sn arası. Müzik yokken sabit 0.62 sn aralık kullanılıyor.
- **Seslendirme:** Bu ortamda Türkçe TTS sesi indirilemedi, bu yüzden brifteki yedek plan uygulandı: sinematik altyazı.
  Konuşanın adı üstte küçük ve bakır (#e8c98f), replik altta beyaz ve ince gölgeli. Spiker ve Warren satırlarının altında,
  bant geçiren filtreden geçmiş boğuk bir "konuşma dokusu" ile TV/telsiz paraziti duyuluyor.
- **Kodlama:** Kareler Playwright/Chromium'da JPEG olarak alınıyor, ffmpeg ile `libx264 -crf 18 yuv420p`, ses `aac 192k`, `+faststart`.

## Bilinen eksikler

- Şaman ve Denek 7 için sprite verilmedi. Şaman küçük bir yedek çizim; Denek 7 yalnızca gölge ve gözlerden ibaret.
- Oyun içi ekran kaydı verilmedi, hiç kullanılmadı.
- Tepeden bakış zemin dokuları (asfalt, üs zemini, tel örgü) oyunun sahnelerini temsil eden basit dokular;
  ekran kayıtları gelirse bunların yerine konabilir.
