// Ground, roads, river, lake, park, trees, streetlights.
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {
  V_STREETS,
  H_STREETS,
  RIVER,
  RIVER_BRANCHES,
  LAKE,
  PARK,
  RIVERWALK,
  ROAD_WIDTH,
  L_TRACK,
  L_STATIONS,
  TRACK_Y,
  BRIDGE_XS,
} from './cityData.js';
import { mulberry32 } from './rng.js';

export function buildCity(scene) {
  const rng = mulberry32(20260815);

  // ---- ground ----
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 420),
    new THREE.MeshStandardMaterial({ color: '#a4ae94', roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(-45, 0, -45);
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- roads (merged into one geometry) ----
  const roadGeos = [];
  const dashGeos = [];
  const walkGeos = []; // sidewalk borders under the asphalt
  const addRoad = (cx, cz, w, d) => {
    const g = new THREE.BoxGeometry(w, 0.12, d);
    g.translate(cx, 0.06, cz);
    roadGeos.push(g);
    const sw = new THREE.BoxGeometry(w + 2.2, 0.09, d + 2.2);
    sw.translate(cx, 0.045, cz);
    walkGeos.push(sw);
  };
  const addDashes = (cx, cz, len, horizontal) => {
    for (let s = -len / 2 + 2; s < len / 2 - 1; s += 5) {
      const g = horizontal
        ? new THREE.BoxGeometry(1.7, 0.13, 0.22)
        : new THREE.BoxGeometry(0.22, 0.13, 1.7);
      g.translate(horizontal ? cx + s : cx, 0.07, horizontal ? cz : cz + s);
      dashGeos.push(g);
    }
  };
  for (const s of V_STREETS) {
    // streets crossing the river stop at the banks, drawbridges span the gap
    const crossesRiver = s.from < RIVER.zMin - 1 && s.to > RIVER.zMax + 1;
    const spans = crossesRiver
      ? [
          [s.from, RIVER.zMin - 1.5],
          [RIVER.zMax + 1.5, s.to],
        ]
      : [[s.from, s.to]];
    for (const [zA, zB] of spans) {
      const len = zB - zA;
      addRoad(s.x, (zA + zB) / 2, ROAD_WIDTH, len);
      addDashes(s.x, (zA + zB) / 2, len, false);
    }
  }
  for (const s of H_STREETS) {
    const len = s.to - s.from;
    addRoad((s.from + s.to) / 2, s.z, len, ROAD_WIDTH);
    addDashes((s.from + s.to) / 2, s.z, len, true);
  }
  const roads = new THREE.Mesh(
    BufferGeometryUtils.mergeGeometries(roadGeos),
    new THREE.MeshStandardMaterial({ color: '#4b4f56', roughness: 0.95 })
  );
  roads.receiveShadow = true;
  scene.add(roads);
  const dashes = new THREE.Mesh(
    BufferGeometryUtils.mergeGeometries(dashGeos),
    new THREE.MeshStandardMaterial({ color: '#9aa0a8', roughness: 0.9 })
  );
  scene.add(dashes);
  const sidewalks = new THREE.Mesh(
    BufferGeometryUtils.mergeGeometries(walkGeos),
    new THREE.MeshStandardMaterial({ color: '#c3bdb0', roughness: 1 })
  );
  sidewalks.receiveShadow = true;
  scene.add(sidewalks);

  // ---- river + lake (turquoise, like the real Chicago River in summer) ----
  const waterMat = new THREE.MeshStandardMaterial({
    color: '#3fa8bd',
    metalness: 0.3,
    roughness: 0.3,
  });
  const river = new THREE.Mesh(
    new THREE.BoxGeometry(RIVER.xMax - RIVER.xMin, 0.08, RIVER.zMax - RIVER.zMin),
    waterMat
  );
  river.position.set((RIVER.xMin + RIVER.xMax) / 2, 0.02, (RIVER.zMin + RIVER.zMax) / 2);
  scene.add(river);

  for (const b of RIVER_BRANCHES) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(b.xMax - b.xMin, 0.08, b.zMax - b.zMin),
      waterMat
    );
    m.position.set((b.xMin + b.xMax) / 2, 0.02, (b.zMin + b.zMax) / 2);
    scene.add(m);
  }

  const lake = new THREE.Mesh(
    new THREE.BoxGeometry(LAKE.xMax - LAKE.xMin, 0.08, LAKE.zMax - LAKE.zMin),
    waterMat
  );
  lake.position.set((LAKE.xMin + LAKE.xMax) / 2, 0.02, (LAKE.zMin + LAKE.zMax) / 2);
  scene.add(lake);

  // scrolling sparkle overlay on the main river
  const sparkleTex = makeSparkleTexture();
  sparkleTex.wrapS = sparkleTex.wrapT = THREE.RepeatWrapping;
  sparkleTex.repeat.set(18, 1);
  const sparkle = new THREE.Mesh(
    new THREE.PlaneGeometry(RIVER.xMax - RIVER.xMin, RIVER.zMax - RIVER.zMin),
    new THREE.MeshBasicMaterial({
      map: sparkleTex,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  sparkle.rotation.x = -Math.PI / 2;
  sparkle.position.set((RIVER.xMin + RIVER.xMax) / 2, 0.09, 0);
  scene.add(sparkle);

  // ---- riverwalk promenade + dressing on BOTH banks ----
  // south bank (+z) and north bank (-z), mirrored across the river.
  const stoneGeos = [];
  const greeneryGeos = [];
  const umbrellaGeos = [];
  const poleGeos = [];
  const chairGeos = [];

  // build one bank; `sign` is +1 (south) or -1 (north)
  const buildBank = (sign) => {
    // promenade walkway
    const rw = new THREE.Mesh(
      new THREE.BoxGeometry(RIVERWALK.xMax - RIVERWALK.xMin, 0.1, RIVERWALK.zMax - RIVERWALK.zMin),
      new THREE.MeshStandardMaterial({ color: '#cdbc9d', roughness: 1 })
    );
    rw.position.set((RIVERWALK.xMin + RIVERWALK.xMax) / 2, 0.05, sign * 5.1);
    scene.add(rw);

    const bZ = sign * 6.6; // balustrade line (against Wacker)
    const stairZones =
      sign > 0
        ? [
            [-20, -13], // dock access
            [-49, -42],
          ]
        : [[-58, -51]];
    const inStair = (x) => stairZones.some(([a, b]) => x > a && x < b);

    const balBase = new THREE.BoxGeometry(146, 0.25, 0.5);
    balBase.translate(-35, 0.16, bZ);
    stoneGeos.push(balBase);
    for (let x = -107; x <= 37; x += 2.6) {
      if (inStair(x)) continue;
      const pil = new THREE.BoxGeometry(0.26, 0.62, 0.26);
      pil.translate(x, 0.6, bZ);
      stoneGeos.push(pil);
    }
    // continuous rail, split around the stair gaps
    let railStart = -107;
    for (const [a, b] of [...stairZones, [38, 38]]) {
      if (a - 1 > railStart) {
        const rail = new THREE.BoxGeometry(a - 1 - railStart, 0.16, 0.42);
        rail.translate((railStart + a - 1) / 2, 0.98, bZ);
        stoneGeos.push(rail);
      }
      railStart = b + 1;
    }
    // urns with bushes
    for (let x = -104; x <= 34; x += 13) {
      if (inStair(x)) continue;
      const urn = new THREE.CylinderGeometry(0.42, 0.3, 0.62, 8);
      urn.translate(x, 1.35, bZ);
      stoneGeos.push(urn);
      const bush = new THREE.SphereGeometry(0.52, 7, 6);
      bush.translate(x, 1.95, bZ);
      greeneryGeos.push(bush);
    }
    // stair steps down through the gaps
    for (const [a, b] of stairZones) {
      const cx = (a + b) / 2;
      for (let s = 0; s < 3; s++) {
        const step = new THREE.BoxGeometry(b - a - 1.2, 0.14, 0.55);
        step.translate(cx, 0.5 - s * 0.18, sign * (6.3 + s * 0.5));
        stoneGeos.push(step);
      }
    }
    // hedge beds along the water's edge (gap at the boat dock on the south bank)
    for (let x = -104; x <= 34; x += 6.2) {
      if (sign > 0 && x > -23 && x < -11) continue;
      const hedge = new THREE.BoxGeometry(3.6, 0.55, 0.75);
      hedge.translate(x + rng() * 1.2, 0.34, sign * 4.35);
      greeneryGeos.push(hedge);
    }
    // riverside cafés: white umbrellas, tables, orange chairs
    const cafeXs = sign > 0 ? [-28, -60, -86] : [-40, -72, 8];
    for (const cx of cafeXs) {
      for (let i = 0; i < 3; i++) {
        const ux = cx + i * 3.4;
        const pole = new THREE.CylinderGeometry(0.05, 0.05, 1.7, 5);
        pole.translate(ux, 0.85, sign * 5.9);
        poleGeos.push(pole);
        const canopy = new THREE.ConeGeometry(1.25, 0.5, 8);
        canopy.translate(ux, 1.85, sign * 5.9);
        umbrellaGeos.push(canopy);
        const table = new THREE.CylinderGeometry(0.48, 0.48, 0.09, 8);
        table.translate(ux, 0.72, sign * 5.9);
        umbrellaGeos.push(table);
        for (const [dx, dz] of [
          [-0.75, 0.3],
          [0.75, -0.2],
        ]) {
          const chair = new THREE.BoxGeometry(0.38, 0.42, 0.38);
          chair.translate(ux + dx, 0.24, sign * 5.9 + dz);
          chairGeos.push(chair);
        }
      }
    }
  };
  buildBank(1);
  buildBank(-1);

  scene.add(
    new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(stoneGeos),
      new THREE.MeshStandardMaterial({ color: '#d9cfba', roughness: 0.9 })
    ),
    new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(greeneryGeos),
      new THREE.MeshStandardMaterial({ color: '#679a58', roughness: 1, flatShading: true })
    ),
    new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(umbrellaGeos),
      new THREE.MeshStandardMaterial({ color: '#f6f3ea', roughness: 0.7 })
    ),
    new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(poleGeos),
      new THREE.MeshStandardMaterial({ color: '#8a8f96', roughness: 0.8 })
    ),
    new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(chairGeos),
      new THREE.MeshStandardMaterial({ color: '#e0703d', roughness: 0.8 })
    )
  );

  // ---- park ----
  const park = new THREE.Mesh(
    new THREE.BoxGeometry(PARK.w, 0.1, PARK.d),
    new THREE.MeshStandardMaterial({ color: '#7fae6a', roughness: 1 })
  );
  park.position.set(PARK.x, 0.05, PARK.z);
  scene.add(park);

  // ---- trees (instanced) ----
  const treeSpots = [];
  for (let x = -105; x <= 38; x += 7) {
    treeSpots.push([x + rng() * 3, 5.4 + rng() * 0.6]); // south riverwalk
    treeSpots.push([x + rng() * 3, -5.4 - rng() * 0.6]); // north riverwalk
  }
  for (let i = 0; i < 14; i++) {
    treeSpots.push([PARK.x - PARK.w / 2 + rng() * PARK.w, PARK.z - PARK.d / 2 + rng() * PARK.d]);
  }
  for (let z = -132; z <= -84; z += 6) {
    treeSpots.push([-52 + rng() * 3, z + rng() * 2]); // gold coast
    treeSpots.push([-38 + rng() * 3, z + rng() * 2]);
  }
  const trunkMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.18, 0.26, 1.4, 5),
    new THREE.MeshStandardMaterial({ color: '#7a5b41', roughness: 1 }),
    treeSpots.length
  );
  const canopyMesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1.15, 0),
    new THREE.MeshStandardMaterial({ color: '#5f9e55', roughness: 1, flatShading: true }),
    treeSpots.length
  );
  const m4 = new THREE.Matrix4();
  treeSpots.forEach(([x, z], i) => {
    const s = 0.8 + rng() * 0.6;
    m4.makeScale(s, s, s).setPosition(x, 0.7 * s, z);
    trunkMesh.setMatrixAt(i, m4);
    m4.makeScale(s, s, s).setPosition(x, 1.9 * s, z);
    canopyMesh.setMatrixAt(i, m4);
  });
  trunkMesh.castShadow = canopyMesh.castShadow = true;
  scene.add(trunkMesh, canopyMesh);

  // ---- streetlights (instanced poles + emissive bulbs) ----
  const lampSpots = [];
  for (let z = -130; z <= 36; z += 16) lampSpots.push([2.2, z]); // michigan
  for (let x = -118; x <= 42; x += 16) lampSpots.push([x, 6.9]); // south riverwalk
  for (let x = -118; x <= 42; x += 16) lampSpots.push([x, -6.9]); // north riverwalk
  for (let x = -110; x <= 8; x += 18) lampSpots.push([x, -79.8]); // chicago ave
  const poleMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.09, 0.12, 3.6, 5),
    new THREE.MeshStandardMaterial({ color: '#3c4046', roughness: 0.8 }),
    lampSpots.length
  );
  const bulbMat = new THREE.MeshStandardMaterial({
    color: '#665f4a',
    emissive: '#ffd98a',
    emissiveIntensity: 0,
  });
  const bulbMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    bulbMat,
    lampSpots.length
  );
  lampSpots.forEach(([x, z], i) => {
    m4.identity().setPosition(x, 1.8, z);
    poleMesh.setMatrixAt(i, m4);
    m4.identity().setPosition(x, 3.7, z);
    bulbMesh.setMatrixAt(i, m4);
  });
  scene.add(poleMesh, bulbMesh);

  // ---- bascule drawbridges over the river ----
  // Each bridge = two deck halves hinged at the banks; they swing open when
  // the tour boat comes through, like Chicago's real drawbridges.
  const bridgeMat = new THREE.MeshStandardMaterial({ color: '#8d6e63', roughness: 0.85 });
  const houseMat = new THREE.MeshStandardMaterial({ color: '#7a6a58', roughness: 0.9 });
  const drawbridges = [];
  for (const bx of BRIDGE_XS) {
    const halves = [];
    for (const side of [1, -1]) {
      // pivot sits at the bank edge; the deck reaches to the river center
      const half = new THREE.Group();
      half.position.set(bx, 0.25, side * 5);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 5.2), bridgeMat);
      deck.position.z = -side * 2.6;
      half.add(deck);
      for (const railSide of [-2.05, 2.05]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 5.2), bridgeMat);
        rail.position.set(railSide, 0.5, -side * 2.6);
        half.add(rail);
      }
      scene.add(half);
      halves.push({ group: half, side });
    }
    // static corner bridge houses
    for (const hz of [-5.7, 5.7]) {
      for (const hx of [-2.4, 2.4]) {
        const house = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2, 1.1), houseMat);
        house.position.set(bx + hx, 1, hz);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.7, 4), houseMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(bx + hx, 2.35, hz);
        scene.add(house, roof);
      }
    }
    drawbridges.push({ x: bx, halves, angle: 0 });
  }

  // ---- flowers (tiny colorful dots, riverwalk, park, gold coast) ----
  const flowerSpots = [];
  for (let x = -104; x <= 36; x += 3.2) {
    if (rng() < 0.75) flowerSpots.push([x + rng() * 2, 5 + rng() * 1.1]);
  }
  for (let i = 0; i < 40; i++) {
    flowerSpots.push([
      PARK.x - PARK.w / 2 + rng() * PARK.w,
      PARK.z - PARK.d / 2 + rng() * PARK.d,
    ]);
  }
  for (let z = -128; z <= -86; z += 4) {
    if (rng() < 0.7) flowerSpots.push([-49 + rng() * 2, z + rng() * 2]);
  }
  const flowerColors = ['#ff8fab', '#ffd166', '#ffffff', '#c9a6f0', '#ff6f61'];
  const flowerMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.22, 6, 5),
    new THREE.MeshStandardMaterial({ roughness: 0.9 }),
    flowerSpots.length
  );
  const fCol = new THREE.Color();
  flowerSpots.forEach(([x, z], i) => {
    m4.identity().setPosition(x, 0.28, z);
    flowerMesh.setMatrixAt(i, m4);
    flowerMesh.setColorAt(i, fCol.set(flowerColors[(rng() * flowerColors.length) | 0]));
  });
  scene.add(flowerMesh);

  // ---- soft drifting clouds ----
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    transparent: true,
    opacity: 0.92,
  });
  const clouds = [];
  for (let i = 0; i < 7; i++) {
    const cloud = new THREE.Group();
    const puffs = 3 + ((rng() * 3) | 0);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(3 + rng() * 3, 10, 8), cloudMat);
      puff.position.set(p * 4 - puffs * 2 + rng() * 2, rng() * 1.5, rng() * 3 - 1.5);
      puff.scale.y = 0.6;
      cloud.add(puff);
    }
    cloud.position.set(-160 + rng() * 300, 55 + rng() * 22, -140 + rng() * 170);
    cloud.userData.speed = 0.8 + rng() * 1.2;
    cloudGroup.add(cloud);
    clouds.push(cloud);
  }
  scene.add(cloudGroup);

  // ---- elevated L track ----
  const trackGeos = [];
  const pillarGeos = [];
  for (let i = 0; i < L_TRACK.length - 1; i++) {
    const [x1, z1] = L_TRACK[i];
    const [x2, z2] = L_TRACK[i + 1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const ang = Math.atan2(-dz, dx);
    const deck = new THREE.BoxGeometry(len + 1.6, 0.4, 2.2);
    deck.rotateY(ang);
    deck.translate((x1 + x2) / 2, TRACK_Y, (z1 + z2) / 2);
    trackGeos.push(deck);
    for (const side of [-1, 1]) {
      const rail = new THREE.BoxGeometry(len, 0.45, 0.18);
      rail.rotateY(ang);
      // offset perpendicular to segment direction
      const px = (-dz / len) * side * 1.05;
      const pz = (dx / len) * side * 1.05;
      rail.translate((x1 + x2) / 2 + px, TRACK_Y + 0.45, (z1 + z2) / 2 + pz);
      trackGeos.push(rail);
    }
    const steps = Math.max(1, Math.floor(len / 9));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = x1 + dx * t;
      const pz = z1 + dz * t;
      const pillar = new THREE.CylinderGeometry(0.35, 0.45, TRACK_Y, 6);
      pillar.translate(px, TRACK_Y / 2, pz);
      pillarGeos.push(pillar);
    }
  }
  const trackMat = new THREE.MeshStandardMaterial({ color: '#93816f', roughness: 0.85 });
  const track = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(trackGeos), trackMat);
  track.castShadow = true;
  scene.add(track);
  const pillars = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(pillarGeos), trackMat);
  scene.add(pillars);

  // station platforms
  const stationMat = new THREE.MeshStandardMaterial({ color: '#b3765c', roughness: 0.8 });
  for (const st of L_STATIONS) {
    const platform = new THREE.Mesh(new THREE.BoxGeometry(6, 0.35, 4.6), stationMat);
    platform.position.set(st.pos[0], TRACK_Y - 0.2, st.pos[1]);
    scene.add(platform);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.25, 5), stationMat);
    roof.position.set(st.pos[0], TRACK_Y + 3.4, st.pos[1]);
    scene.add(roof);
    for (const [sx, sz] of [
      [-3, -2.4],
      [3, -2.4],
      [-3, 2.4],
      [3, 2.4],
    ]) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.4, 5),
        stationMat
      );
      post.position.set(st.pos[0] + sx, TRACK_Y + 1.6, st.pos[1] + sz);
      scene.add(post);
    }
  }

  return {
    setLamps(v) {
      bulbMat.emissiveIntensity = v * 1.6;
    },
    update(dt, boatX = null, boatZ = 0, cruising = false) {
      sparkleTex.offset.x -= dt * 0.015;
      for (const cloud of clouds) {
        cloud.position.x += cloud.userData.speed * dt;
        if (cloud.position.x > 170) cloud.position.x = -180;
      }
      // drawbridges open ahead of the approaching boat
      for (const b of drawbridges) {
        const shouldOpen =
          cruising && boatX !== null && Math.abs(boatX - b.x) < 15 && Math.abs(boatZ) < 8;
        const target = shouldOpen ? 1.05 : 0;
        b.angle += (target - b.angle) * Math.min(1, dt * 2.2);
        for (const h of b.halves) {
          h.group.rotation.x = h.side * b.angle;
        }
      }
    },
  };
}

function makeSparkleTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 64;
    const w = 4 + Math.random() * 14;
    ctx.fillRect(x, y, w, 1.3);
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
