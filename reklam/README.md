# LAST BREATH — Reklam Filmi

Brifteki 30–45 sn'lik akışı uygulayan, tarayıcıda oynayan 42 saniyelik reklam filmi.
Tek dosya: `index.html`. Tüm görüntü canvas üzerinde gerçek zamanlı çiziliyor, ses efektleri Web Audio ile sentezleniyor.
Her kare yalnızca zamana bağlı olduğu için zaman çizelgesinde istediğin yere sarabilirsin.

Sahne sahne döküm için: [SENARYO.md](SENARYO.md)

## Çalıştırma

Görsellerin ve müziğin yüklenmesi ve WebM kaydının çalışması için sayfayı yerel bir sunucudan aç
(`file://` ile açınca tarayıcı canvas kaydını ve müziği güvenlik gereği engelliyor):

```bash
cd reklam
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000
```

- **Sesli Oynat**: Tarayıcılar sesi ancak bir tıklamadan sonra çalar.
- **Boşluk** oynatır ya da duraklatır, **← →** yarım saniye sarar.
- `?t=29.6` gibi bir parametre sayfayı o saniyede açar.
- **● WebM Kaydet**: Filmi baştan oynatıp görüntü ve sesi birlikte 1920×1080 `.webm` olarak indirir.
  Kayıt gerçek zamanlıdır (42 sn). MP4 gerekiyorsa: `ffmpeg -i last-breath-reklam.webm -c:v libx264 -crf 18 -c:a aac last-breath-reklam.mp4`

## Görseller ve müzik

Dosyaları `reklam/assets/` klasörüne aşağıdaki adlarla koy. Eksik olanın yerine prosedürel çizim kullanılır,
sayfanın altındaki listede hangisinin yüklendiği görünür.

| Dosya | Kullanıldığı yer |
|---|---|
| `ashbound-logo.png` | Açılış logosu (metalik ışık geçişi şeffaf alanlara taşmaz) ve kapanıştaki küçük logo |
| `kapak.jpg` | Başlık ve kapanış sahnelerinde karartılmış arka plan |
| `ethan.png`, `sarah.png` | Karakter sprite'ları |
| `zombi.png`, `kosucu.png`, `tank.png`, `zirhli.png` | Zombi sprite'ları |
| `from-the-darkness.mp3` | Müzik |

Farklı ad ya da uzantı kullanıyorsan `index.html` başındaki `CONFIG.assets` bölümünü düzenle.

**Sprite yönü:** Varsayılan olarak sprite'ların görselde **yukarı** baktığı kabul ediliyor.
Sağa bakıyorlarsa `CONFIG.spriteFacing` değerini `0` yap. Boyut için `CONFIG.spriteSize` kullan.

**Müzik:** `CONFIG.musicOffset` (varsayılan 30) parçanın hangi saniyeden başlayacağını belirler.
30 ile, 31. saniyedeki LAST BREATH darbesi parçanın enerji zirvesine (60–85 sn) denk geliyor.

## Bilinen sınırlamalar

- Şaman ve Denek 7 için sprite yok, bunlar her zaman prosedürel çiziliyor.
- Kayıt, ekrana çizilen kare hızına bağlı. Zayıf bir makinede kaydederken başka sekmeleri kapat.
