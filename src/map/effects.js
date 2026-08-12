// Celebration fireworks + confetti, and floating hearts for the finale.
import * as THREE from 'three';

const FIREWORK_COLORS = ['#ff7a9c', '#ffd166', '#7ae2c9', '#c5a3ff', '#ffffff'];

export function buildEffects(scene) {
  // ---------- fireworks (pooled THREE.Points bursts) ----------
  const bursts = [];
  for (let i = 0; i < 8; i++) {
    const count = 220;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const mat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 1.4,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);
    bursts.push({
      points,
      velocities: new Float32Array(count * 3),
      life: 0,
      active: false,
    });
  }

  function launchBurst(x, y, z, color) {
    const b = bursts.find((b) => !b.active);
    if (!b) return;
    b.active = true;
    b.life = 0;
    b.points.material.color.set(color);
    b.points.material.opacity = 1;
    const pos = b.points.geometry.attributes.position.array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 6 + Math.random() * 10;
      b.velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      b.velocities[i * 3 + 1] = speed * Math.cos(phi);
      b.velocities[i * 3 + 2] = speed * Math.sin(phi) * Math.sin(theta);
    }
    b.points.geometry.attributes.position.needsUpdate = true;
  }

  let showTimer = -1;
  let showBurstsLeft = 0;
  let nextBurstIn = 0;

  // ---------- confetti (instanced planes raining over downtown) ----------
  const CONFETTI = 400;
  const confettiGeo = new THREE.PlaneGeometry(0.36, 0.52);
  const confettiMat = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    vertexColors: false,
  });
  const confetti = new THREE.InstancedMesh(confettiGeo, confettiMat, CONFETTI);
  confetti.frustumCulled = false;
  const cCol = new THREE.Color();
  for (let i = 0; i < CONFETTI; i++) {
    confetti.setColorAt(i, cCol.set(FIREWORK_COLORS[i % FIREWORK_COLORS.length]));
  }
  confetti.visible = false;
  scene.add(confetti);
  const confettiState = new Float32Array(CONFETTI * 5); // x, y, z, fallSpeed, phase
  let confettiActive = false;
  let confettiDensity = 1;
  const m4 = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const vec = new THREE.Vector3();
  const scl = new THREE.Vector3(1, 1, 1);

  function startConfetti() {
    confettiActive = true;
    confetti.visible = true;
    confettiDensity = 1;
    for (let i = 0; i < CONFETTI; i++) {
      confettiState[i * 5] = -60 + Math.random() * 110; // x over downtown core
      confettiState[i * 5 + 1] = 20 + Math.random() * 55;
      confettiState[i * 5 + 2] = -90 + Math.random() * 130;
      confettiState[i * 5 + 3] = 2.5 + Math.random() * 3.5;
      confettiState[i * 5 + 4] = Math.random() * Math.PI * 2;
    }
  }

  function stopConfetti() {
    confettiActive = false;
    confetti.visible = false;
  }

  // ---------- floating hearts (finale) ----------
  const HEARTS = 26;
  const heartTex = makeHeartTexture();
  const hearts = [];
  for (let i = 0; i < HEARTS; i++) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: heartTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    );
    s.scale.setScalar(1.6 + Math.random() * 1.6);
    scene.add(s);
    hearts.push({ sprite: s, t: Math.random() * 5, active: false });
  }
  let heartsActive = false;
  let heartsOrigin = new THREE.Vector3();

  let time = 0;

  return {
    startFireworkShow(centerX, centerZ) {
      showTimer = 0;
      showBurstsLeft = 8;
      nextBurstIn = 0.1;
      this._fwCenter = [centerX, centerZ];
    },
    startConfetti,
    stopConfetti,
    setConfettiDensity(v) {
      confettiDensity = v;
    },
    startHearts(origin) {
      heartsActive = true;
      heartsOrigin.copy(origin);
      hearts.forEach((h, i) => {
        h.active = true;
        h.t = -i * 0.35 - Math.random() * 0.5;
      });
    },
    stopHearts() {
      heartsActive = false;
      hearts.forEach((h) => {
        h.active = false;
        h.sprite.material.opacity = 0;
      });
    },
    update(dt) {
      time += dt;

      // firework show scheduler
      if (showBurstsLeft > 0) {
        nextBurstIn -= dt;
        if (nextBurstIn <= 0) {
          const [cx, cz] = this._fwCenter || [-20, -30];
          launchBurst(
            cx - 40 + Math.random() * 80,
            34 + Math.random() * 26,
            cz - 35 + Math.random() * 60,
            FIREWORK_COLORS[(Math.random() * FIREWORK_COLORS.length) | 0]
          );
          showBurstsLeft--;
          nextBurstIn = 0.45 + Math.random() * 0.5;
        }
      }

      // burst particles
      for (const b of bursts) {
        if (!b.active) continue;
        b.life += dt;
        const pos = b.points.geometry.attributes.position.array;
        for (let i = 0; i < pos.length / 3; i++) {
          b.velocities[i * 3 + 1] -= 9 * dt;
          pos[i * 3] += b.velocities[i * 3] * dt;
          pos[i * 3 + 1] += b.velocities[i * 3 + 1] * dt;
          pos[i * 3 + 2] += b.velocities[i * 3 + 2] * dt;
        }
        b.points.geometry.attributes.position.needsUpdate = true;
        b.points.material.opacity = Math.max(0, 1 - b.life / 1.8);
        if (b.life > 1.8) {
          b.active = false;
          b.points.material.opacity = 0;
        }
      }

      // confetti
      if (confettiActive) {
        const visibleCount = Math.floor(CONFETTI * confettiDensity);
        for (let i = 0; i < CONFETTI; i++) {
          let y = confettiState[i * 5 + 1] - confettiState[i * 5 + 3] * dt;
          if (y < 0.5) y = 20 + Math.random() * 45;
          confettiState[i * 5 + 1] = y;
          const phase = confettiState[i * 5 + 4];
          const x = confettiState[i * 5] + Math.sin(time * 1.5 + phase) * 0.02;
          confettiState[i * 5] = x;
          euler.set(time * 2 + phase, phase, time * 3 + phase);
          quat.setFromEuler(euler);
          const visible = i < visibleCount;
          scl.setScalar(visible ? 1 : 0.0001);
          m4.compose(vec.set(x, y, confettiState[i * 5 + 2]), quat, scl);
          confetti.setMatrixAt(i, m4);
        }
        confetti.instanceMatrix.needsUpdate = true;
      }

      // hearts
      if (heartsActive) {
        for (const h of hearts) {
          if (!h.active) continue;
          h.t += dt;
          if (h.t < 0) continue;
          const cycle = 4.5;
          const u = (h.t % cycle) / cycle;
          const seed = h.sprite.id * 0.61;
          h.sprite.position.set(
            heartsOrigin.x + Math.sin(seed * 9 + u * 6) * (2 + (seed % 3)),
            heartsOrigin.y + 1 + u * 26,
            heartsOrigin.z + Math.cos(seed * 7 + u * 5) * (2 + (seed % 2))
          );
          h.sprite.material.opacity = u < 0.1 ? u * 10 : 1 - (u - 0.1) / 0.9;
        }
      }
    },
  };
}

function makeHeartTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = '96px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💗', 64, 72);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
