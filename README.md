# CTI Dashboard (Ransomware Threat Intelligence)

Bu proje, fidye yazılımı (ransomware) saldırılarını analiz etmek ve görselleştirmek için hazırlanmış bir Cyber Threat Intelligence dashboard uygulamasıdır. Backend tarafında Go kullanılarak `data.csv` dosyası okunur, temizlenir ve API üzerinden sunulur. Frontend tarafında ise React + Vite ile grafikler, tablolar ve analiz ekranları gösterilir.

Uygulama Docker ile tek komutla çalıştırılabilecek şekilde hazırlanmıştır.

```txt
┌──────────────────────┐        /api/*          ┌────────────────────────┐
│  React + Recharts UI  │  ───────────────────▶ │  Go API (net/http)      │
│  (served as static)   │ ◀───────────────────  │  loads + cleans data.csv│
└──────────────────────┘        JSON            └────────────────────────┘
```

## Türkçe Özet

Bu proje, ransomware saldırılarına ait kayıtları tek bir panel üzerinden incelemek için geliştirilmiş bir CTI dashboard çalışmasıdır. Uygulamada ransomware grupları, hedef ülkeler, sektörler, saldırı vektörleri, MITRE ATT&CK teknikleri, severity değerleri ve IOC bilgileri analiz edilmektedir.

Tüm veriler proje içerisindeki `data.csv` dosyasından alınmaktadır. Harici bir API veya canlı veri kaynağı kullanılmamıştır.

## Veri Kaynağı (`data.csv`)

Veri seti, ransomware olaylarına yönelik açık kaynak araştırmalar, tehdit istihbaratı yayınları ve fidye yazılımı takip platformlarında yer alan olaylardan yararlanılarak hazırlanmıştır. Bazı kayıtlar ise proje gereksinimlerine uygun olacak şekilde düzenlenmiş ve simüle edilmiştir.

Veri hazırlanırken faydalanılan başlıca kaynak türleri:

- Ransomware olay analizleri
- Siber güvenlik blogları
- Tehdit istihbaratı raporları
- Ransomware takip platformları
- Açık kaynak olay kayıtları

Örnek kaynaklar:

- Ransomware.live
- RansomLook
- RansomFeed
- DarkFeed
- Ransomwatch

`data.csv` sütunları:

| Sütun | Açıklama |
|------|----------|
| `date` | Saldırı tarihi |
| `ransomware_group` | Ransomware grubu / tehdit aktörü |
| `country` | Hedef ülke |
| `target_sector` | Hedef sektör |
| `attack_vector` | Saldırı vektörü |
| `technique` | MITRE ATT&CK tekniği |
| `Severity` | Önem derecesi |
| `ioc_ip` | Opsiyonel IP IOC değeri |
| `ioc_hash` | Opsiyonel hash IOC değeri |

## Genel İşleyiş

1. Go backend uygulama açılırken `data.csv` dosyasını okur.
2. Ülke, sektör, saldırı vektörü, ransomware grup adı ve MITRE teknik bilgileri temizlenir.
3. Temizlenmiş kayıtlar ve hesaplanan istatistikler `/api/*` endpointleri üzerinden JSON olarak sunulur.
4. React arayüzü bu verileri alarak dashboard ekranlarında grafik ve tablolarla gösterir.
5. IOC Search ekranında kullanıcı IP veya hash değeri girerek ilgili kayıtları arayabilir.

## Özellikler

### Genel Dashboard

Ana ekranda veri setine ait temel özet bilgiler yer almaktadır. Toplam saldırı sayısı, ortalama severity, aktif ransomware grupları, sektör dağılımları ve güncel kayıtlar bu alanda gösterilir.

### Ransomware Grup Analizi

Threat Groups ekranında ransomware grupları saldırı sayısı, ortalama severity ve hedef dağılımlarına göre incelenebilir. Her grup için profil kartları ve detay bilgileri gösterilmektedir.

### Ülke ve Sektör Analizi

Saldırıların hangi ülke ve sektörlerde yoğunlaştığı grafikler üzerinden gösterilir. Sektörler daha okunabilir olması için belirli ana kategoriler altında gruplanmıştır.

### Zaman Bazlı Analiz

Timeline ekranında saldırıların zamana göre dağılımı gösterilmektedir. Aylık saldırı hacmi, severity trendi ve dönemsel değişimler bu bölümden takip edilebilir.

### MITRE ATT&CK Teknik Analizi

Saldırı kayıtlarında yer alan MITRE ATT&CK teknikleri ayrıştırılarak grafiklerde gösterilir. Böylece en sık kullanılan tekniklerin hangi alanlarda yoğunlaştığı görülebilir.

### IOC Search

Kullanıcı IP adresi veya hash değeri girerek veri setinde arama yapabilir. Eşleşme bulunursa ilgili saldırı kaydı, ransomware grubu ve severity bilgisi listelenir.

## Eklenen Yeni Özellikler

### Threat Group Comparison

Projeye ek olarak iki farklı ransomware grubunu karşılaştırmaya yarayan bir Compare modülü eklenmiştir.

Bu ekranda kullanıcı iki ransomware grubunu seçerek aşağıdaki metrikleri yan yana inceleyebilir:

- Toplam saldırı sayısı
- Ortalama severity
- Kritik olay sayısı
- Kritik olay oranı
- Hedeflenen ülke sayısı
- Hedeflenen sektör sayısı
- En çok hedeflenen ülke
- En çok hedeflenen sektör
- En sık kullanılan saldırı vektörü
- En sık kullanılan MITRE ATT&CK tekniği
- Veri setindeki ilk ve son görülme tarihleri

Ayrıca iki grup arasındaki ortak hedef ülkeler, ortak sektörler ve ortak kullanılan MITRE teknikleri de gösterilmektedir. Bu sayede ransomware gruplarının davranışları sadece ayrı ayrı değil, karşılaştırmalı olarak da analiz edilebilmektedir.

Compare ekranı frontend tarafında `/api/records` endpointinden gelen veriyi kullanarak hesaplama yapmaktadır. Bunun yanında backend tarafında aynı amaçla kullanılabilecek ayrı bir karşılaştırma endpointi de eklenmiştir.

```txt
GET /api/threat-groups/compare?groupA=CMD&groupB=Qilin
```

### Threat Actor Badge Sistemi

Gerçek ransomware grup logoları kullanılmamıştır. Bunun yerine her tehdit grubu için grup adından otomatik olarak baş harf tabanlı badge oluşturulmaktadır.

Örnekler:

| Grup | Badge |
|------|-------|
| Qilin | Q |
| The Gentlemen | TG |
| Space Bears | SB |
| DragonForce | DF |
| Brain Cipher | BC |
| CMD | CMD |

Bu yöntemle arayüzde görsel bütünlük sağlanmış ve dış kaynaklı logo kullanımına ihtiyaç duyulmamıştır.

### Grup Adı Normalizasyonu

Veri setindeki bazı ransomware grup isimleri farklı yazım biçimleriyle gelebilmektedir. Backend ve frontend tarafında bu isimler daha tutarlı görünmesi için normalize edilmiştir.

Örnekler:

| Gelen Değer | Gösterilen Değer |
|------------|------------------|
| `3am`, `3AM` | `3AM` |
| `Auditteam`, `Audit Team` | `Audit Team` |
| `Braincipher`, `Brain Cipher` | `Brain Cipher` |
| `Ransomhouse`, `RansomHouse` | `RansomHouse` |
| `Shinyhunters`, `ShinyHunters` | `ShinyHunters` |
| `Play (PlayCrypt)` | `Play` |
| `Cmdorganization`, `CMD` | `CMD` |

> `The Gentlemen` ayrı bir tehdit grubu olarak tutulmaktadır ve `CMD` ile birleştirilmemektedir.

## API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/health` | API durumu ve kayıt sayısı |
| GET | `/api/records` | Temizlenmiş tüm saldırı kayıtları |
| GET | `/api/overview` | Genel özet metrikleri |
| GET | `/api/stats/groups` | Ransomware grubu istatistikleri |
| GET | `/api/stats/countries` | Ülke bazlı saldırı dağılımı |
| GET | `/api/stats/sectors` | Sektör bazlı saldırı dağılımı |
| GET | `/api/stats/vectors` | Saldırı vektörü dağılımı |
| GET | `/api/stats/techniques` | MITRE ATT&CK teknik dağılımı |
| GET | `/api/stats/timeline` | Zaman bazlı saldırı trendleri |
| GET | `/api/stats/severity` | Severity histogramı |
| GET | `/api/ioc/search?q=` | IP veya hash ile IOC arama |
| GET | `/api/ioc/samples` | Örnek IOC değerleri |
| GET | `/api/threat-groups/compare` | İki ransomware grubunu karşılaştırma endpointi |

## Docker ile Çalıştırma

Projeyi Docker ile çalıştırmak için proje ana dizininde şu komut kullanılabilir:

```bash
docker compose up --build
```

Ardından tarayıcıdan şu adres açılır:

```txt
http://localhost:8090
```

Uygulamayı durdurmak için terminalde:

```bash
CTRL + C
```

Tamamen kapatmak için:

```bash
docker compose down
```

## Local Geliştirme

Backend için:

```bash
cd backend
DATA_CSV=../data.csv go run .
```

Windows PowerShell kullanılıyorsa:

```powershell
cd backend
$env:DATA_CSV="../data.csv"
go run .
```

Frontend için ayrı bir terminalde:

```bash
cd frontend
npm install
npm run dev
```

Frontend geliştirme ortamında varsayılan olarak şu adreste çalışır:

```txt
http://localhost:5173
```

## Proje Yapısı

```txt
.
├── data.csv
├── Dockerfile
├── docker-compose.yml
├── backend/
│   ├── main.go
│   └── internal/
│       ├── api/
│       └── cti/
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── context/
        ├── data/
        ├── utils/
        └── assets/
```

## Proje Kapsamında Hazırlananlar

- Çalışan ransomware CTI dashboard uygulaması
- En az 100 kayıt içeren veri seti
- Genel özet ekranı
- Ransomware grup dağılımı
- Ülke ve sektör bazlı analizler
- Zaman bazlı saldırı trendleri
- Ortalama severity hesaplamaları
- MITRE ATT&CK teknik analizi
- IOC arama modülü
- Threat Group Comparison modülü
- Threat Actor Badge sistemi
- Docker ile çalıştırılabilir proje yapısı
- Kaynak kodlar

