# Storyboard to Video (V2 — Hybrid 2D + WebGL 3D Engine)

Pipeline TypeScript + Remotion + Three.js (`@remotion/three`) untuk merender storyboard JSON menjadi video MP4 dengan **satu file audio narasi global**, transkrip SRT bertimestamp, serta dukungan **adegan 3D WebGL prosedural** maupun SVG/HTML 2D.

## Apa yang Baru di V2

- **WebGL 3D Scene Engine (`visual.type = "three"`):** Mendukung 4 arketipe 3D siap pakai (`floating-cards`, `isometric-blocks`, `network-nodes`, `paper-flip-stage`) dengan pencahayaan studio, bayangan, partikel atmosferik, tekstur kartu/dokumen Hi-DPI, dan pergerakan kamera 3D berbasis `useCurrentFrame()`.
- **Auto Aspect-Ratio Framing:** Otomatis menyesuaikan jarak kamera 3D untuk format lanskap (`1920x1080`) maupun vertikal (`1080x1920`).
- **Cinematic Post-Overlay:** Lapisan *vignette*, *accent hairline*, dan *deterministic film grain* agar adegan 2D dan 3D menyatu secara visual.
- **Style Bible (`STYLE.md`):** Panduan desain dan skema prompt untuk men-generate storyboard 3D menggunakan LLM.

## Persiapan

1. Install dependensi:
   ```bash
   npm install
   ```
2. Pastikan `ffmpeg` dan `ffprobe` tersedia di `PATH`.
3. Siapkan satu file audio dan satu file transkrip SRT (path ditulis relatif terhadap lokasi `storyboard.json`).

## CLI

```bash
# Validasi storyboard 3D
npm run validate -- --storyboard example/storyboard-3d.json
npm run validate -- --storyboard project1/storyboard-3d.json

# Jalankan Remotion Studio
npm run preview -- --storyboard project1/storyboard-3d.json

# Render MP4 final
npm run render -- --storyboard project1/storyboard-3d.json

# Render cepat (setengah resolusi, 15fps)
npm run render -- --storyboard project1/storyboard-3d.json --draft

# Render di server/Colab tanpa GPU fisik (memakai SwiftShader)
npm run render -- --storyboard project1/storyboard-3d.json --gl swiftshader
```

Opsi `--no-subtitles` tetap tersedia untuk menonaktifkan layer subtitle.
