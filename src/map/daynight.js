// Day/night cycle: gradient sky dome, stars, sun/moon sprites, and a
// lighting rig whose parameters lerp between keyframed states.
import * as THREE from 'three';

const STATES = {
  goldenHour: {
    top: '#8aa7e0',
    bottom: '#ffb36b',
    fog: '#f2c193',
    sunPos: [-100, 26, 40],
    sunColor: '#ffab52',
    sunIntensity: 1.75,
    hemi: 0.55,
    windows: 0.1,
    lamps: 0,
    stars: 0,
  },
  dusk: {
    top: '#4a4e8f',
    bottom: '#e78bb0',
    fog: '#b78ab5',
    sunPos: [-90, 10, 60],
    sunColor: '#ff8f6b',
    sunIntensity: 0.7,
    hemi: 0.4,
    windows: 0.55,
    lamps: 0.6,
    stars: 0.15,
  },
  night: {
    top: '#0d1030',
    bottom: '#27356b',
    fog: '#141a3d',
    sunPos: [70, 55, -40],
    sunColor: '#9db4ff',
    sunIntensity: 0.55,
    hemi: 0.22,
    windows: 1,
    lamps: 1,
    stars: 1,
  },
  dawn: {
    top: '#5a6fb5',
    bottom: '#ffb3a0',
    fog: '#d9a4a0',
    sunPos: [95, 14, 30],
    sunColor: '#ff9b80',
    sunIntensity: 0.8,
    hemi: 0.4,
    windows: 0.4,
    lamps: 0.4,
    stars: 0.2,
  },
  morning: {
    top: '#7fb2e8',
    bottom: '#fdeecb',
    fog: '#dcebf7',
    sunPos: [85, 48, 20],
    sunColor: '#fff1c9',
    sunIntensity: 1.4,
    hemi: 0.65,
    windows: 0,
    lamps: 0,
    stars: 0,
  },
  day: {
    top: '#63a4e8',
    bottom: '#cfe8ff',
    fog: '#d7ecff',
    sunPos: [30, 85, -25],
    sunColor: '#ffffff',
    sunIntensity: 1.55,
    hemi: 0.7,
    windows: 0,
    lamps: 0,
    stars: 0,
  },
  sunset: {
    top: '#5d5fa8',
    bottom: '#ff9e7d',
    fog: '#eda58f',
    sunPos: [-95, 12, 10],
    sunColor: '#ff7e5f',
    sunIntensity: 1.1,
    hemi: 0.45,
    windows: 0.6,
    lamps: 0.55,
    stars: 0.12,
  },
};

export function buildDayNight(scene, { onWindows, onLamps }) {
  // ---- sky dome ----
  const skyUniforms = {
    topColor: { value: new THREE.Color(STATES.goldenHour.top) },
    bottomColor: { value: new THREE.Color(STATES.goldenHour.bottom) },
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(320, 24, 16),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `
        varying float vY;
        void main() {
          vY = normalize(position).y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying float vY;
        void main() {
          float h = clamp(vY * 1.5 + 0.18, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, pow(h, 0.75)), 1.0);
        }
      `,
    })
  );
  dome.position.set(-45, 0, -45);
  scene.add(dome);

  // ---- stars ----
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(420 * 3);
  for (let i = 0; i < 420; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;
    const r = 300;
    starPos[i * 3] = -45 + r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = 30 + r * Math.cos(phi);
    starPos[i * 3 + 2] = -45 + r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 1.4,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
    sizeAttenuation: false,
  });
  starMat.size = 2;
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---- lights ----
  const hemi = new THREE.HemisphereLight('#ffffff', '#6b705c', 0.55);
  const ambient = new THREE.AmbientLight('#ffffff', 0.18);
  const sun = new THREE.DirectionalLight('#ffb361', 1.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -110;
  sun.shadow.camera.right = 110;
  sun.shadow.camera.top = 110;
  sun.shadow.camera.bottom = -110;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 420;
  sun.target.position.set(-30, 0, -40);
  scene.add(hemi, ambient, sun, sun.target);

  // ---- fog ----
  scene.fog = new THREE.Fog('#f2c193', 130, 340);

  // scratch objects for blending
  const cTop = new THREE.Color();
  const cBottom = new THREE.Color();
  const cFog = new THREE.Color();
  const cSun = new THREE.Color();
  const vSun = new THREE.Vector3();
  const cA = new THREE.Color();
  const cB = new THREE.Color();
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();

  function blend(keyA, keyB, t) {
    const a = STATES[keyA];
    const b = STATES[keyB];
    const s = t * t * (3 - 2 * t); // smoothstep

    skyUniforms.topColor.value.copy(cTop.copy(cA.set(a.top)).lerp(cB.set(b.top), s));
    skyUniforms.bottomColor.value.copy(
      cBottom.copy(cA.set(a.bottom)).lerp(cB.set(b.bottom), s)
    );
    scene.fog.color.copy(cFog.copy(cA.set(a.fog)).lerp(cB.set(b.fog), s));

    vSun.copy(vA.fromArray(a.sunPos)).lerp(vB.fromArray(b.sunPos), s);
    sun.position.copy(vSun);
    sun.color.copy(cSun.copy(cA.set(a.sunColor)).lerp(cB.set(b.sunColor), s));
    sun.intensity = a.sunIntensity + (b.sunIntensity - a.sunIntensity) * s;
    hemi.intensity = a.hemi + (b.hemi - a.hemi) * s;

    starMat.opacity = a.stars + (b.stars - a.stars) * s;
    onWindows(a.windows + (b.windows - a.windows) * s);
    onLamps(a.lamps + (b.lamps - a.lamps) * s);
  }

  blend('goldenHour', 'goldenHour', 0);

  return { blend };
}
