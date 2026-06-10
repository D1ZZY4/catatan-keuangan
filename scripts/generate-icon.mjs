/**
 * Generates a placeholder 1024x1024 PNG icon for Catat Artha.
 * Run: node scripts/generate-icon.mjs
 */
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function generateIcon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#FFF9D2');
  grad.addColorStop(1, '#F5EEC8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const pad = size * 0.12;
  drawRoundedRect(ctx, pad, pad, size - pad * 2, size - pad * 2, size * 0.15);
  ctx.fillStyle = '#8CC0EB';
  ctx.fill();

  ctx.fillStyle = '#1A1814';
  ctx.font = `bold ${size * 0.45}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', size / 2, size / 2 + size * 0.02);

  const buf = canvas.toBuffer('image/png');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  console.log(`✓ Generated ${outPath} (${size}x${size})`);
}

const root = join(__dirname, '..');
generateIcon(1024, join(root, 'assets', 'icon.png'));
generateIcon(1024, join(root, 'assets', 'adaptive-icon.png'));
generateIcon(1024, join(root, 'assets', 'splash.png'));
console.log('Done!');
