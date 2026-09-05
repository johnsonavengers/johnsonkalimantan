# JOHNSON UNTUK KALIMANTAN

Situs campaign dan dashboard transparansi publik untuk komitmen alokasi **10% dari penjualan campaign Johnson yang memenuhi ketentuan untuk Kalimantan**.

Dashboard ini diperbarui setiap hari. Angka penjualan, donasi, order, grafik, status penyaluran, dan tabel transparansi semuanya dihitung otomatis dari satu file data.

## Sumber data utama

Seluruh data campaign berada di:

```text
data/campaign.json
```

Jangan menulis total penjualan atau total donasi secara manual di halaman situs. Untuk pembaruan harian, cukup edit file tersebut.

Struktur data:

```json
{
  "campaign": {
    "name": "JOHNSON UNTUK KALIMANTAN",
    "status": "active",
    "donationRate": 0.1,
    "startDate": "2026-09-01",
    "endDate": "2026-09-30",
    "donationTarget": null,
    "currency": "IDR",
    "shopUrl": "",
    "lastUpdated": null
  },
  "daily": [],
  "disbursements": []
}
```

`donationTarget` boleh dibiarkan `null` jika belum ada target resmi. `shopUrl` juga boleh kosong sampai tautan toko resmi tersedia.

## Cara memperbarui data harian

Tambahkan satu catatan baru ke bagian `daily`:

```json
{
  "date": "2026-09-05",
  "sales": 430000000,
  "orders": 428
}
```

Kemudian perbarui `campaign.lastUpdated` menggunakan zona waktu WIB:

```json
"lastUpdated": "2026-09-05T12:00:00+07:00"
```

Sebelum menyimpan, periksa bahwa:

- tanggal belum pernah dicatat;
- tanggal berada di dalam periode campaign;
- penjualan lebih dari nol;
- jumlah order tidak negatif;
- angka menggunakan bilangan biasa tanpa titik pemisah;
- format JSON tetap valid.

Jika tanggal sudah ada, perbarui catatan yang lama. Jangan membuat tanggal ganda.

## Cara perhitungan bekerja

Dashboard menghitung otomatis:

- total penjualan = jumlah semua `daily.sales`;
- donasi harian = `sales × donationRate`;
- total donasi = total penjualan × `donationRate`;
- total order = jumlah semua `daily.orders`;
- campaign day = jarak tanggal mulai sampai tanggal data terbaru;
- total disalurkan = jumlah semua `disbursements.amount`;
- menunggu disalurkan = total donasi dikurangi total disalurkan, minimum nol;
- progres target = total donasi dibagi target donasi.

## Menambahkan bukti penyaluran

Setelah dana benar-benar disalurkan, tambahkan catatan ke `disbursements`:

```json
{
  "date": "2026-10-05",
  "amount": 100000000,
  "recipient": "Nama penerima resmi",
  "description": "Penyaluran pertama dana campaign",
  "proofUrl": "/proofs/transfer-2026-10-05.pdf",
  "documentationUrl": ""
}
```

Simpan dokumen bukti publik di folder `public/proofs`. Jangan menambahkan nama penerima, tanggal, nominal, atau dokumen yang belum terverifikasi.

## Menjalankan situs secara lokal

Persyaratan: Node.js versi 22.13 atau lebih baru.

```bash
npm install
npm run dev
```

Buka alamat lokal yang muncul. Untuk memeriksa versi produksi:

```bash
npm run build
```

## Alur GitHub

Setelah data diperiksa:

```bash
git add data/campaign.json
git commit -m "Update campaign data 2026-09-05"
git push origin main
```

Jangan commit kata sandi, token, atau data privat. Versi ini tidak membutuhkan API key.

## Deployment

Proyek menggunakan Next.js App Router standar. Dependensi Vinext, Vite, dan Cloudflare telah dihapus.

Di Vercel, pilih **Add New → Project**, lalu impor repository `johnsonavengers/johnsonkalimantan`. Gunakan framework **Next.js**, root directory proyek, build command `npm run build`, dan output directory default. Tidak diperlukan environment variable. Setelah terhubung, setiap push ke `main` akan memicu deployment otomatis.

Jalankan `npm test` untuk memeriksa build produksi, halaman utama, dan kesesuaian API dengan file data. Jalankan `npm run lint` untuk pemeriksaan kode.

Tidak diperlukan database atau server admin untuk memperbarui data campaign.

## Checklist pemeriksaan mobile

Periksa lebar 375 px, 390 px, 430 px, tablet, dan desktop:

- tidak ada halaman yang bergeser horizontal;
- angka donasi tidak terpotong;
- navigasi tetap mudah digunakan;
- kartu tersusun rapi;
- kalkulator dapat diisi;
- alur dana mudah diikuti;
- tabel berubah menjadi kartu yang terbaca pada ponsel;
- tautan dan tombol mudah disentuh;
- grafik mengikuti lebar layar;
- tanggal pembaruan tetap terlihat.

## Prinsip transparansi

Data harian tidak disebut real-time. Jangan mengarang penjualan, bukti transfer, penerima, mitra, atau dampak lingkungan. Bila belum ada penyaluran, dashboard harus tetap menampilkan nol dan status menunggu.
