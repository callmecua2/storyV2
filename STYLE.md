# STYLE.md — Hybrid 3D Visual Style Bible

Dokumen ini menjadi panduan standar bagi AI/LLM maupun editor manusia saat menyusun `storyboard.json` agar hasil render video memiliki kualitas sinematik yang konsisten dari awal hingga akhir.

---

## 1. Filosofi Visual

- **Dark Editorial Workbench:** Gunakan latar gelap kontras tinggi (`#0F172A` atau `#090F1D`) dengan pencahayaan studio (*key light* + *rim light* berwarna aksen) agar elemen 3D tampil tajam dan tidak datar.
- **Satu Warna Aksen Dominan:** Gunakan satu warna aksen utama (`theme.accent`, misalnya `#F59E0B` amber, `#38BDF8` cyan, atau `#EF4444` merah peringatan) untuk menyorot poin terpenting di setiap adegan.
- **Teks Singkat & Terbaca:** Hindari paragraf panjang di dalam objek 3D. Batasi judul kartu 2–4 kata, dan gunakan `on_screen_text` maksimal 3–4 kata sebagai jangkar visual.

---

## 2. Pilihan Preset 3D (`visual.type = "three"`)

Gunakan variasi preset antar adegan agar ritme visual dinamis (hindari memakai preset yang sama lebih dari 2 kali berturut-turut):

| Preset | Kapan Digunakan | Properti `data` Utama |
| :--- | :--- | :--- |
| **`floating-cards`** | Penjelasan poin kunci, perbandingan 2–4 konsep, sorotan fakta. | `data.cards`: array `{ label, title, value, subtitle, highlight }` |
| **`isometric-blocks`** | Perbandingan angka, persentase, eskalasi masalah, atau tahapan bertingkat. | `data.blocks`: array `{ label, value, displayValue, highlight }` |
| **`network-nodes`** | Ekosistem, hubungan aktor, aliran transaksi, struktur sistem, penyebaran jaringan. | `data.nodes`: array `{ id, label, sublabel, size, highlight }` (item pertama = pusat/hub) |
| **`paper-flip-stage`** | Kronologi investigasi, dokumen bukti, arsip kasus, langkah berurutan. | `data.cards`: array `{ label, title, value, subtitle, highlight }` |

---

## 3. Aturan Kamera & Gerakan (`camera` & `motion`)

- **Selalu Gerakkan Kamera:** Jangan biarkan `camera.from` sama persis dengan `camera.to`. Berikan pergeseran halus (misalnya `z` dari `6.4` ke `4.8` untuk *dolly-in* atau `x` dari `-1.2` ke `1.2` untuk *orbit*).
- **Kompensasi Layar Vertikal (9:16):** Engine secara otomatis menyesuaikan jarak kamera saat rasio layar vertikal (`1080x1920`), sehingga koordinat standar seperti `[0, 1.4, 6.4]` aman dipakai baik untuk `1920x1080` maupun `1080x1920`.
- **Kombinasi `motion`:** `zoom_in`, `zoom_out`, `pan_left`, dan `pan_right` pada adegan `three` akan memodulasi pergerakan kamera 3D secara langsung (bukan *zoom* piksel 2D).

---

## 4. Contoh Struktur Scene 3D untuk Prompt LLM

```json
{
  "id": 1,
  "start": 0,
  "end": 8.0,
  "visual": {
    "type": "three",
    "preset": "network-nodes",
    "camera": {
      "from": [0, 1.5, 6.6],
      "to": [0.3, 0.7, 5.0],
      "fov": 42,
      "lookAt": [0, 0.1, 0]
    },
    "data": {
      "nodes": [
        { "id": "hub", "label": "SISTEM UTAMA", "sublabel": "CORE", "size": 1.3, "highlight": true },
        { "id": "n1", "label": "MODUL A", "sublabel": "INPUT", "size": 0.95, "highlight": false },
        { "id": "n2", "label": "MODUL B", "sublabel": "PROSES", "size": 0.95, "highlight": false },
        { "id": "n3", "label": "MODUL C", "sublabel": "OUTPUT", "size": 0.95, "highlight": true }
      ],
      "autoRotateSpeed": 0.16
    }
  },
  "on_screen_text": "Arsitektur sistem",
  "motion": "zoom_in",
  "transition": "fade"
}
```
