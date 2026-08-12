// Lake Michigan dressing: Navy Pier with a turning Ferris wheel, the harbor
// lighthouse, a breakwater, drifting sailboats, buoys, and circling gulls.
import * as THREE from 'three';
import { mulberry32 } from './rng.js';

export function buildLake(scene) {
  const rng = mulberry32(77);

  // ---------- Navy Pier ----------
  // Group sits at world x=60; local +x points out into the lake (east),
  // local -x reaches back to the mainland (west, shore at world x≈46).
  const pier = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: '#cdbc9d', roughness: 1 });
  const white = new THREE.MeshStandardMaterial({ color: '#f2efe6', roughness: 0.7 });
  // long deck: west end rests on land (world 39), east end out in the lake (world 81)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(42, 0.8, 6.5), deckMat);
  deck.position.set(0, 0.4, 0);
  pier.add(deck);
  // wide entrance plaza where the pier meets the mainland
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 11), deckMat);
  plaza.position.set(-20, 0.3, 0);
  pier.add(plaza);
  // pilings only under the over-water span (world x > ~47 → local > -13)
  for (let x = -12; x <= 20; x += 4.5) {
    for (const pz of [-2.6, 2.6]) {
      const piling = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 1.2, 5),
        new THREE.MeshStandardMaterial({ color: '#7a5b41', roughness: 1 })
      );
      piling.position.set(x, 0, pz);
      pier.add(piling);
    }
  }
  // gateway arch at the land entrance
  for (const gz of [-2.4, 2.4]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3, 0.7), white);
    post.position.set(-18, 1.5, gz);
    pier.add(post);
  }
  const gateBeam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 5.5), white);
  gateBeam.position.set(-18, 3.1, 0);
  pier.add(gateBeam);
  // exhibition hall with a red roof (mid-pier)
  const hall = new THREE.Mesh(new THREE.BoxGeometry(14, 2.1, 4), white);
  hall.position.set(-6, 1.85, 0);
  const hallRoof = new THREE.Mesh(
    new THREE.BoxGeometry(14.6, 0.5, 4.5),
    new THREE.MeshStandardMaterial({ color: '#b34a3d', roughness: 0.8 })
  );
  hallRoof.position.set(-6, 3.1, 0);
  pier.add(hall, hallRoof);
  // domed ballroom
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    white
  );
  dome.position.set(6, 0.8, 0);
  const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.4, 14), white);
  domeBase.position.set(6, 1.1, 0);
  pier.add(domeBase, dome);

  // Ferris wheel (Centennial Wheel) — at the LAKE end, rotates slowly, glows for bloom
  const wheel = new THREE.Group();
  const ringMat = new THREE.MeshStandardMaterial({
    color: '#e8ecf0',
    emissive: '#ffd0e0',
    emissiveIntensity: 0.35,
    roughness: 0.5,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.18, 8, 32), ringMat);
  wheel.add(ring);
  for (let i = 0; i < 8; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.14, 10.2, 0.14), ringMat);
    spoke.rotation.z = (i * Math.PI) / 8;
    wheel.add(spoke);
  }
  const gondolaColors = ['#ff8fab', '#6ea8fe', '#ffd166', '#8fd3c7', '#c9a6f0', '#f4a261'];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const gondola = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: gondolaColors[i % gondolaColors.length], roughness: 0.6 })
    );
    gondola.position.set(Math.cos(ang) * 5.2, Math.sin(ang) * 5.2, 0);
    wheel.add(gondola);
  }
  wheel.position.set(16, 7.6, 0);
  pier.add(wheel);
  for (const side of [1, -1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.8, 0.35), ringMat);
    leg.position.set(16 + side * 1.8, 4, side * 1);
    leg.rotation.z = side * 0.22;
    pier.add(leg);
  }
  pier.position.set(60, 0, -16);
  scene.add(pier);

  // ---------- Chicago Harbor Lighthouse ----------
  const lighthouse = new THREE.Group();
  const lhBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.7, 10), white);
  lhBase.position.y = 0.35;
  const lhTower = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.05, 4.4, 10), white);
  lhTower.position.y = 2.7;
  const lhBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 1.0, 0.8, 10),
    new THREE.MeshStandardMaterial({ color: '#c23b2e', roughness: 0.7 })
  );
  lhBand.position.y = 1.6;
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 8, 8),
    new THREE.MeshStandardMaterial({
      color: '#fff2c0',
      emissive: '#ffe08a',
      emissiveIntensity: 1.2,
    })
  );
  lamp.position.y = 5.2;
  const lhRoof = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.8, 10),
    new THREE.MeshStandardMaterial({ color: '#c23b2e', roughness: 0.7 })
  );
  lhRoof.position.y = 5.9;
  lighthouse.add(lhBase, lhTower, lhBand, lamp, lhRoof);
  lighthouse.position.set(53, 0, 9);
  scene.add(lighthouse);

  // ---------- breakwater (with a gap for the boat channel) ----------
  const stoneMat = new THREE.MeshStandardMaterial({ color: '#9a958a', roughness: 1 });
  for (const [zc, len] of [
    [-25, 24],
    [18, 20],
  ]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, len), stoneMat);
    wall.position.set(61, 0.25, zc);
    scene.add(wall);
  }

  // ---------- sailboats ----------
  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 0);
  sailShape.lineTo(0, 2.1);
  sailShape.lineTo(1.25, 0.35);
  sailShape.closePath();
  const sailGeo = new THREE.ShapeGeometry(sailShape);
  const sailMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    side: THREE.DoubleSide,
    roughness: 0.6,
  });
  const hullMat = new THREE.MeshStandardMaterial({ color: '#f4f1e8', roughness: 0.7 });
  const sailboats = [];
  const spots = [
    [56, -38],
    [74, -32],
    [92, -20],
    [70, 26],
    [88, 16],
    [100, 34],
  ];
  for (const [sx, sz] of spots) {
    const b = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 0.75), hullMat);
    hull.position.y = 0.28;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), hullMat);
    mast.position.y = 1.5;
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0.06, 0.55, 0);
    b.add(hull, mast, sail);
    b.position.set(sx, 0, sz);
    b.rotation.y = rng() * Math.PI * 2;
    scene.add(b);
    sailboats.push({ group: b, phase: rng() * Math.PI * 2, drift: 0.12 + rng() * 0.15 });
  }

  // ---------- buoys ----------
  const buoyMat = new THREE.MeshStandardMaterial({ color: '#e04545', roughness: 0.6 });
  const buoys = [];
  for (const [bx, bz] of [
    [50, 6],
    [56, -8],
    [70, -9],
    [84, 7],
    [93, -7],
    [76, 9],
  ]) {
    const buoy = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 7), buoyMat);
    buoy.position.set(bx, 0.45, bz);
    scene.add(buoy);
    buoys.push({ mesh: buoy, phase: rng() * Math.PI * 2 });
  }

  // ---------- seagulls circling the pier ----------
  const gullCanvas = document.createElement('canvas');
  gullCanvas.width = gullCanvas.height = 64;
  const gctx = gullCanvas.getContext('2d');
  gctx.strokeStyle = '#ffffff';
  gctx.lineWidth = 5;
  gctx.lineCap = 'round';
  gctx.beginPath();
  gctx.moveTo(8, 40);
  gctx.quadraticCurveTo(22, 22, 32, 36);
  gctx.quadraticCurveTo(42, 22, 56, 40);
  gctx.stroke();
  const gullTex = new THREE.CanvasTexture(gullCanvas);
  const gulls = [];
  for (let i = 0; i < 4; i++) {
    const gull = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: gullTex, transparent: true, depthWrite: false })
    );
    gull.scale.setScalar(1.6 + rng());
    scene.add(gull);
    gulls.push({
      sprite: gull,
      angle: rng() * Math.PI * 2,
      radius: 6 + rng() * 9,
      height: 10 + rng() * 5,
      speed: 0.25 + rng() * 0.3,
    });
  }

  let t = 0;
  return {
    update(dt) {
      t += dt;
      wheel.rotation.z += dt * 0.22;
      for (const s of sailboats) {
        s.group.rotation.y += dt * 0.05;
        s.group.rotation.z = Math.sin(t * 1.4 + s.phase) * 0.05;
        s.group.position.y = Math.sin(t * 1.1 + s.phase) * 0.06;
      }
      for (const b of buoys) {
        b.mesh.position.y = 0.45 + Math.sin(t * 1.6 + b.phase) * 0.12;
        b.mesh.rotation.z = Math.sin(t * 1.2 + b.phase) * 0.15;
      }
      for (const g of gulls) {
        g.angle += dt * g.speed;
        g.sprite.position.set(
          63 - 9.5 + Math.cos(g.angle) * g.radius,
          g.height + Math.sin(t * 2 + g.radius) * 0.6,
          -16 + Math.sin(g.angle) * g.radius
        );
      }
    },
  };
}
