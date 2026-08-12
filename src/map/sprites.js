// Canvas-texture sprite helpers (emoji sprites + stop markers).
import * as THREE from 'three';

export function makeEmojiSprite(emoji, scale = 3) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = '100px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 64, 72);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  sprite.scale.setScalar(scale);
  return sprite;
}

// hand-drawn Apple-logo silhouette (apple with a bite + leaf)
function drawApple(ctx, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.bezierCurveTo(-8, -40, -28, -42, -38, -28);
  ctx.bezierCurveTo(-50, -10, -44, 24, -30, 38);
  ctx.bezierCurveTo(-22, 46, -12, 46, -6, 42);
  ctx.bezierCurveTo(-2, 40, 2, 40, 6, 42);
  ctx.bezierCurveTo(12, 46, 22, 46, 30, 38);
  ctx.bezierCurveTo(44, 24, 50, -10, 38, -28);
  ctx.bezierCurveTo(28, -42, 8, -40, 0, -30);
  ctx.closePath();
  ctx.fill();
  // the bite
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(46, 0, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // the leaf
  ctx.beginPath();
  ctx.ellipse(11, -46, 15, 8, -0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function appleLogoCanvas(size = 96, color = '#111111') {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  drawApple(ctx, size / 2, size / 2 + size * 0.03, size * 0.78, color);
  return c;
}

// side-profile of our white two-deck architecture tour boat
export function tourBoatCanvas(size = 96) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.scale(size / 120, size / 120);
  // soft navy halo so the white boat reads on light backgrounds
  ctx.shadowColor = 'rgba(29, 58, 95, 0.6)';
  ctx.shadowBlur = 4;

  // hull with pointed bow (facing right)
  ctx.fillStyle = '#f7f5ef';
  ctx.beginPath();
  ctx.moveTo(-50, 4);
  ctx.lineTo(42, 4);
  ctx.lineTo(55, 13);
  ctx.lineTo(50, 22);
  ctx.lineTo(-50, 22);
  ctx.closePath();
  ctx.fill();
  // navy waterline
  ctx.fillStyle = '#1d3a5f';
  ctx.beginPath();
  ctx.moveTo(-50, 15);
  ctx.lineTo(52, 15);
  ctx.lineTo(50, 22);
  ctx.lineTo(-50, 22);
  ctx.closePath();
  ctx.fill();
  // lower cabin + window band
  ctx.fillStyle = '#f7f5ef';
  ctx.fillRect(-42, -12, 72, 16);
  ctx.fillStyle = '#37505f';
  ctx.fillRect(-40, -9, 68, 7);
  // gold upper deck
  ctx.fillStyle = '#c8952e';
  ctx.fillRect(-45, -16, 80, 5);
  // railing
  ctx.fillStyle = '#f7f5ef';
  ctx.fillRect(-45, -27, 78, 2.5);
  for (let x = -43; x <= 30; x += 9) {
    ctx.fillRect(x, -25, 1.8, 9);
  }
  // wheelhouse at the stern
  ctx.fillStyle = '#f7f5ef';
  ctx.fillRect(-45, -26, 13, 10);
  // little passengers on the top deck
  const pals = ['#ff8fab', '#6ea8fe', '#ffd166', '#8fd3c7', '#c9a6f0'];
  pals.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(-24 + i * 11, -19, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
  // bow flag
  ctx.strokeStyle = '#f7f5ef';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(48, 10);
  ctx.lineTo(48, -14);
  ctx.stroke();
  ctx.fillStyle = '#e63b60';
  ctx.beginPath();
  ctx.moveTo(48, -14);
  ctx.lineTo(58, -10.5);
  ctx.lineTo(48, -7);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  return c;
}

const MARKER_PASTELS = [
  ['#ffd9e2', '#f7a6ba'],
  ['#ffe9c7', '#f5c98a'],
  ['#d9f2d5', '#a4d9a0'],
  ['#d6e9ff', '#a3c6f0'],
  ['#ecdcff', '#c7a8ef'],
  ['#fff3d0', '#f2d98a'],
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// markers render through buildings so a stop is never hidden.
// pastel balloon cards, Animal Crossing style.
export function makeMarkerSprite(emoji, scale = 6, colorIndex = 0, logoCanvas = null) {
  const c = document.createElement('canvas');
  c.width = c.height = 192;
  const ctx = c.getContext('2d');
  const [light, dark] = MARKER_PASTELS[colorIndex % MARKER_PASTELS.length];

  // soft shadow
  ctx.save();
  ctx.filter = 'blur(6px)';
  ctx.fillStyle = 'rgba(90,60,70,0.28)';
  ctx.beginPath();
  ctx.ellipse(96, 172, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // balloon card
  const grad = ctx.createLinearGradient(0, 20, 0, 130);
  grad.addColorStop(0, light);
  grad.addColorStop(1, dark);
  ctx.fillStyle = grad;
  roundRect(ctx, 36, 18, 120, 112, 34);
  ctx.fill();
  // tail
  ctx.beginPath();
  ctx.moveTo(80, 124);
  ctx.lineTo(112, 124);
  ctx.lineTo(96, 156);
  ctx.closePath();
  ctx.fill();
  // inner outline
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 5;
  roundRect(ctx, 42, 24, 108, 100, 29);
  ctx.stroke();
  // gloss
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(70, 42, 22, 11, -0.4, 0, Math.PI * 2);
  ctx.fill();

  if (logoCanvas) {
    ctx.drawImage(logoCanvas, 62, 40, 68, 68);
  } else {
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 96, 76);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false })
  );
  sprite.renderOrder = 999;
  sprite.scale.setScalar(scale);
  return sprite;
}
