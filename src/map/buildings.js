// Generic low-poly city fill: one InstancedMesh of boxes with per-instance
// pastel colors and a shared emissive window texture that glows at night.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  V_STREETS,
  H_STREETS,
  RIVER,
  RIVER_BRANCHES,
  LAKE,
  PARK,
  RIVERWALK,
  EXCLUSIONS,
  MAP_BOUNDS,
  ROAD_WIDTH,
  L_TRACK,
} from './cityData.js';
import { STOPS } from './itinerary.js';
import { mulberry32 } from './rng.js';

const PALETTE = [
  '#b8b2a7',
  '#a8b7c7',
  '#c7a8a8',
  '#9aa8b5',
  '#bfb6c9',
  '#a7c0b8',
  '#c9beac',
  '#8f9bb0',
];

export function buildBuildings(scene) {
  const rng = mulberry32(814);
  const placements = [];
  const MAX = 480;

  let attempts = 0;
  while (placements.length < MAX && attempts < 4000) {
    attempts++;
    const x = MAP_BOUNDS.xMin + rng() * (MAP_BOUNDS.xMax - MAP_BOUNDS.xMin);
    const z = MAP_BOUNDS.zMin + rng() * (MAP_BOUNDS.zMax - MAP_BOUNDS.zMin);
    const w = 4.5 + rng() * 5;
    const d = 4.5 + rng() * 5;
    if (!fits(x, z, w, d)) continue;

    // taller near the Michigan/Wacker core, shorter toward Gold Coast
    const core = Math.max(0, 1 - Math.hypot(x - 0, z + 10) / 130);
    let h = 5 + core * core * 38 * (0.35 + rng() * 0.65) + rng() * 5;
    // keep buildings low near stops so the camera can always see the couple
    for (const st of STOPS) {
      const dist = Math.hypot(x - st.pos[0], z - st.pos[1]);
      if (dist < 30) h = Math.min(h, 8 + dist * 0.45);
    }
    placements.push({ x, z, w, d, h, c: PALETTE[(rng() * PALETTE.length) | 0] });
  }

  const windowTex = makeWindowTexture();
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.85,
    emissive: new THREE.Color('#ffd98a'),
    emissiveIntensity: 0,
    emissiveMap: windowTex,
  });
  // rounded box = soft beveled edges that catch the light
  const mesh = new THREE.InstancedMesh(
    new RoundedBoxGeometry(1, 1, 1, 2, 0.045),
    mat,
    placements.length
  );
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  placements.forEach((p, i) => {
    m4.makeScale(p.w, p.h, p.d).setPosition(p.x, p.h / 2, p.z);
    mesh.setMatrixAt(i, m4);
    mesh.setColorAt(i, col.set(p.c));
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // rooftop clutter: AC units on mid-rises, water towers on a few
  const acSpots = [];
  const towerSpots = [];
  for (const p of placements) {
    if (p.h > 14 && rng() < 0.55) {
      const n = 1 + ((rng() * 3) | 0);
      for (let k = 0; k < n; k++) {
        acSpots.push([
          p.x + (rng() - 0.5) * p.w * 0.5,
          p.h,
          p.z + (rng() - 0.5) * p.d * 0.5,
          0.8 + rng() * 0.9,
        ]);
      }
    }
    if (p.h > 10 && p.h < 30 && rng() < 0.14) {
      towerSpots.push([p.x + (rng() - 0.5) * p.w * 0.4, p.h, p.z + (rng() - 0.5) * p.d * 0.4]);
    }
  }
  const acMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 0.7, 1),
    new THREE.MeshStandardMaterial({ color: '#8e959c', roughness: 0.85 }),
    acSpots.length
  );
  acSpots.forEach(([x, y, z, s], i) => {
    m4.makeScale(s, s, s).setPosition(x, y + 0.35 * s, z);
    acMesh.setMatrixAt(i, m4);
  });
  scene.add(acMesh);

  const towerBodyMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.9, 1.05, 1.7, 8),
    new THREE.MeshStandardMaterial({ color: '#a9784f', roughness: 0.9 }),
    towerSpots.length
  );
  const towerRoofMesh = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.05, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: '#7c5636', roughness: 0.9 }),
    towerSpots.length
  );
  towerSpots.forEach(([x, y, z], i) => {
    m4.identity().setPosition(x, y + 1.5, z);
    towerBodyMesh.setMatrixAt(i, m4);
    m4.identity().setPosition(x, y + 2.75, z);
    towerRoofMesh.setMatrixAt(i, m4);
  });
  scene.add(towerBodyMesh, towerRoofMesh);

  return {
    mesh,
    setNight(v) {
      mat.emissiveIntensity = v * 0.68;
    },
  };
}

function fits(x, z, w, d) {
  const rx = w / 2;
  const rz = d / 2;
  const margin = 1.4;

  // water & park & riverwalk
  if (overlaps(x, z, rx, rz, RIVER.xMin, RIVER.xMax, RIVER.zMin, RIVER.zMax, 2)) return false;
  for (const b of RIVER_BRANCHES) {
    if (overlaps(x, z, rx, rz, b.xMin, b.xMax, b.zMin, b.zMax, 2)) return false;
  }
  if (overlaps(x, z, rx, rz, LAKE.xMin, LAKE.xMax, LAKE.zMin, LAKE.zMax, 2)) return false;
  if (
    overlaps(x, z, rx, rz, PARK.x - PARK.w / 2, PARK.x + PARK.w / 2, PARK.z - PARK.d / 2, PARK.z + PARK.d / 2, 1)
  ) {
    return false;
  }
  if (
    overlaps(x, z, rx, rz, RIVERWALK.xMin, RIVERWALK.xMax, RIVERWALK.zMin, RIVERWALK.zMax, 0.5)
  ) {
    return false;
  }

  // roads
  for (const s of V_STREETS) {
    if (z + rz > s.from - 1 && z - rz < s.to + 1) {
      if (Math.abs(x - s.x) < rx + ROAD_WIDTH / 2 + margin) return false;
    }
  }
  for (const s of H_STREETS) {
    if (x + rx > s.from - 1 && x - rx < s.to + 1) {
      if (Math.abs(z - s.z) < rz + ROAD_WIDTH / 2 + margin) return false;
    }
  }

  // the elevated L track needs a clear corridor
  for (let i = 0; i < L_TRACK.length - 1; i++) {
    if (segDist(x, z, L_TRACK[i], L_TRACK[i + 1]) < Math.max(rx, rz) + 3.5) return false;
  }

  // stops & landmark clearings
  for (const st of STOPS) {
    if (Math.hypot(x - st.pos[0], z - st.pos[1]) < Math.max(rx, rz) + 5) return false;
  }
  for (const [ex, ez, er] of EXCLUSIONS) {
    if (Math.hypot(x - ex, z - ez) < Math.max(rx, rz) + er) return false;
  }
  return true;
}

function overlaps(x, z, rx, rz, xMin, xMax, zMin, zMax, pad) {
  return x + rx > xMin - pad && x - rx < xMax + pad && z + rz > zMin - pad && z - rz < zMax + pad;
}

function segDist(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

function makeWindowTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 64, 96);
  for (let y = 6; y < 92; y += 9) {
    for (let x = 5; x < 60; x += 9) {
      if (Math.random() < 0.62) {
        ctx.fillStyle = Math.random() < 0.8 ? '#ffffff' : '#b0c8ff';
        ctx.fillRect(x, y, 4.5, 5.5);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
