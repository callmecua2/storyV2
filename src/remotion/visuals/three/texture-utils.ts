import * as THREE from 'three';

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return `rgba(245, 158, 11, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        const remaining = [line, ...words.slice(i + 1)].join(' ');
        ctx.fillText(remaining, x, currentY, maxWidth);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY, maxWidth);
    currentY += lineHeight;
  }
  return currentY;
}

function createBaseCanvas(width: number, height: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export interface CardTextureOptions {
  label?: string;
  title: string;
  value?: string;
  subtitle?: string;
  highlight?: boolean;
  bgColor: string;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
}

export function createCardTexture(opts: CardTextureOptions): THREE.CanvasTexture {
  const width = 1024;
  const height = 640;
  const canvas = createBaseCanvas(width, height);
  if (!canvas) return new THREE.CanvasTexture(new Uint8Array(4) as unknown as TexImageSource);

  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, opts.highlight ? '#162238' : '#111B2E');
  grad.addColorStop(1, opts.bgColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle corner accent glow
  const glow = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 420);
  glow.addColorStop(0, hexToRgba(opts.accentColor, opts.highlight ? 0.34 : 0.16));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Subtle technical grid lines inside card
  ctx.strokeStyle = hexToRgba(opts.textColor, 0.04);
  ctx.lineWidth = 2;
  for (let gx = 64; gx < width; gx += 64) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }

  // Border frame
  drawRoundedRect(ctx, 18, 18, width - 36, height - 36, 32);
  ctx.strokeStyle = opts.highlight
    ? hexToRgba(opts.accentColor, 0.85)
    : hexToRgba(opts.textColor, 0.22);
  ctx.lineWidth = opts.highlight ? 6 : 3;
  ctx.stroke();

  // Left accent bar
  drawRoundedRect(ctx, 56, 62, 12, 74, 6);
  ctx.fillStyle = opts.accentColor;
  ctx.fill();

  // Top label pill
  const labelText = (opts.label || 'DATA POINT').toUpperCase();
  ctx.font = `700 28px "${opts.fontBody}", sans-serif`;
  ctx.fillStyle = opts.accentColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, 92, 98);

  // Main Title
  ctx.fillStyle = opts.textColor;
  ctx.font = `700 58px "${opts.fontHeading}", sans-serif`;
  ctx.textBaseline = 'top';
  const afterTitleY = wrapText(ctx, opts.title, 60, 175, width - 120, 70, 2);

  // Hero Value (if present)
  let nextY = afterTitleY + 24;
  if (opts.value) {
    ctx.fillStyle = opts.accentColor;
    ctx.font = `800 84px "${opts.fontHeading}", sans-serif`;
    ctx.fillText(opts.value, 60, nextY, width - 120);
    nextY += 108;
  }

  // Subtitle
  if (opts.subtitle) {
    ctx.fillStyle = hexToRgba(opts.textColor, 0.78);
    ctx.font = `500 36px "${opts.fontBody}", sans-serif`;
    wrapText(ctx, opts.subtitle, 60, nextY, width - 120, 48, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export interface BadgeTextureOptions {
  label: string;
  valueText: string;
  highlight?: boolean;
  bgColor: string;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
}

export function createBadgeTexture(opts: BadgeTextureOptions): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = createBaseCanvas(width, height);
  if (!canvas) return new THREE.CanvasTexture(new Uint8Array(4) as unknown as TexImageSource);

  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  drawRoundedRect(ctx, 12, 12, width - 24, height - 24, 28);
  ctx.fillStyle = opts.highlight ? hexToRgba(opts.accentColor, 0.95) : hexToRgba(opts.bgColor, 0.92);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = opts.highlight ? opts.textColor : opts.accentColor;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = opts.highlight ? opts.bgColor : opts.accentColor;
  ctx.font = `800 68px "${opts.fontHeading}", sans-serif`;
  ctx.fillText(opts.valueText, width / 2, 98, width - 56);

  ctx.fillStyle = opts.highlight ? opts.bgColor : opts.textColor;
  ctx.font = `700 32px "${opts.fontBody}", sans-serif`;
  ctx.fillText(opts.label.toUpperCase(), width / 2, 178, width - 56);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

export interface DocumentPageOptions {
  index: number;
  total: number;
  tag: string;
  title: string;
  summary: string;
  metric?: string;
  highlight?: boolean;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
}

export function createDocumentPageTexture(opts: DocumentPageOptions): THREE.CanvasTexture {
  const width = 768;
  const height = 1024;
  const canvas = createBaseCanvas(width, height);
  if (!canvas) return new THREE.CanvasTexture(new Uint8Array(4) as unknown as TexImageSource);

  const ctx = canvas.getContext('2d')!;

  // Warm archival paper / dark slate dossier surface
  ctx.fillStyle = opts.highlight ? '#1E293B' : '#131C31';
  ctx.fillRect(0, 0, width, height);

  // Top header band
  ctx.fillStyle = opts.accentColor;
  ctx.fillRect(0, 0, width, 22);

  // Outer border
  drawRoundedRect(ctx, 20, 40, width - 40, height - 60, 20);
  ctx.strokeStyle = opts.highlight
    ? hexToRgba(opts.accentColor, 0.85)
    : hexToRgba(opts.textColor, 0.25);
  ctx.lineWidth = 4;
  ctx.stroke();

  // Header metadata
  ctx.fillStyle = opts.accentColor;
  ctx.font = `700 28px "${opts.fontBody}", sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(`DOKUMEN #0${opts.index + 1} / 0${opts.total}`, 54, 78);

  ctx.fillStyle = hexToRgba(opts.textColor, 0.6);
  ctx.font = `600 26px "${opts.fontBody}", sans-serif`;
  ctx.fillText(opts.tag.toUpperCase(), 54, 122);

  // Divider line
  ctx.strokeStyle = hexToRgba(opts.textColor, 0.18);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(54, 174);
  ctx.lineTo(width - 54, 174);
  ctx.stroke();

  // Title
  ctx.fillStyle = opts.textColor;
  ctx.font = `700 54px "${opts.fontHeading}", sans-serif`;
  const nextY = wrapText(ctx, opts.title, 54, 215, width - 108, 66, 3);

  // Optional Highlight Metric Box
  let bodyY = nextY + 30;
  if (opts.metric) {
    drawRoundedRect(ctx, 54, bodyY, width - 108, 124, 16);
    ctx.fillStyle = hexToRgba(opts.accentColor, 0.16);
    ctx.fill();
    ctx.strokeStyle = opts.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = opts.accentColor;
    ctx.font = `800 56px "${opts.fontHeading}", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.metric, 84, bodyY + 62, width - 168);
    ctx.textBaseline = 'top';
    bodyY += 160;
  }

  // Summary text
  ctx.fillStyle = hexToRgba(opts.textColor, 0.84);
  ctx.font = `500 36px "${opts.fontBody}", sans-serif`;
  wrapText(ctx, opts.summary, 54, bodyY, width - 108, 50, 5);

  // Decorative schematic lines at bottom
  const barBaseY = height - 150;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? opts.accentColor : hexToRgba(opts.textColor, 0.16);
    drawRoundedRect(ctx, 54, barBaseY + i * 24, (width - 108) * (0.9 - i * 0.18), 10, 5);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function createGridFloorTexture(accentColor: string, bgColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = createBaseCanvas(size, size);
  if (!canvas) return new THREE.CanvasTexture(new Uint8Array(4) as unknown as TexImageSource);

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Minor grid
  ctx.strokeStyle = hexToRgba(accentColor, 0.12);
  ctx.lineWidth = 2;
  const step = 64;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Major border
  ctx.strokeStyle = hexToRgba(accentColor, 0.34);
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
