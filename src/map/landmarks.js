// Hero landmark meshes: Hancock, Marina City, Wrigley, Tribune, the hotel
// (with a floating heart), a tiny Bean, and the architecture-tour boat.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { LANDMARKS } from './cityData.js';
import { makeEmojiSprite, appleLogoCanvas } from './sprites.js';
import { C } from '../content.js';

export function buildLandmarks(scene) {
  const group = new THREE.Group();
  scene.add(group);

  // ---- 360 Chicago / Hancock ----
  const hancock = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 6.4, 88, 4),
    new THREE.MeshStandardMaterial({ color: '#23262c', roughness: 0.55, metalness: 0.35 })
  );
  tower.rotation.y = Math.PI / 4;
  tower.position.y = 44;
  tower.castShadow = true;
  hancock.add(tower);
  const braceMat = new THREE.MeshStandardMaterial({ color: '#cfd6dd', roughness: 0.5 });
  for (let level = 0; level < 3; level++) {
    const y = 16 + level * 26;
    const w = 8.4 - level * 1.6;
    for (const s of [1, -1]) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.5, w * 1.5, 0.5), braceMat);
      brace.position.set(0, y, 4.9 - level * 1.0);
      brace.rotation.z = s * 0.6;
      hancock.add(brace);
      const brace2 = brace.clone();
      brace2.position.z = -(4.9 - level * 1.0);
      hancock.add(brace2);
    }
  }
  for (const s of [1, -1]) {
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 12, 5),
      new THREE.MeshStandardMaterial({ color: '#e8ecf0' })
    );
    antenna.position.set(s * 1.6, 94, 0);
    hancock.add(antenna);
  }
  hancock.position.set(LANDMARKS.hancock[0], 0, LANDMARKS.hancock[1]);
  group.add(hancock);

  // ---- Marina City twin "corn cobs" ----
  const marinaMat = new THREE.MeshStandardMaterial({ color: '#cbc4b8', roughness: 0.9 });
  for (const key of ['marinaA', 'marinaB']) {
    const towerGroup = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 40, 14), marinaMat);
    core.position.y = 20;
    core.castShadow = true;
    towerGroup.add(core);
    for (let i = 0; i < 9; i++) {
      const lip = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.1, 0.5, 14), marinaMat);
      lip.position.y = 6 + i * 4;
      towerGroup.add(lip);
    }
    towerGroup.position.set(LANDMARKS[key][0], 0, LANDMARKS[key][1]);
    group.add(towerGroup);
  }

  // ---- Wrigley Building ----
  const wrigley = new THREE.Group();
  const wrigleyMat = new THREE.MeshStandardMaterial({ color: '#f2efe6', roughness: 0.85 });
  const wBase = new THREE.Mesh(new THREE.BoxGeometry(6.5, 22, 5), wrigleyMat);
  wBase.position.y = 11;
  wBase.castShadow = true;
  const wTower = new THREE.Mesh(new THREE.BoxGeometry(3.4, 10, 3.4), wrigleyMat);
  wTower.position.y = 27;
  const wTop = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.7, 4, 8), wrigleyMat);
  wTop.position.y = 34;
  wrigley.add(wBase, wTower, wTop);
  wrigley.position.set(LANDMARKS.wrigley[0], 0, LANDMARKS.wrigley[1]);
  group.add(wrigley);

  // ---- Tribune Tower ----
  const tribune = new THREE.Group();
  const tribMat = new THREE.MeshStandardMaterial({ color: '#9b968c', roughness: 0.9 });
  const tBase = new THREE.Mesh(new THREE.BoxGeometry(6, 30, 6), tribMat);
  tBase.position.y = 15;
  tBase.castShadow = true;
  tribune.add(tBase);
  for (const [sx, sz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]) {
    const pin = new THREE.Mesh(new THREE.ConeGeometry(0.7, 4.5, 4), tribMat);
    pin.position.set(sx * 2.3, 32, sz * 2.3);
    tribune.add(pin);
  }
  tribune.position.set(LANDMARKS.tribune[0], 0, LANDMARKS.tribune[1]);
  group.add(tribune);

  // ---- The River Hotel (with floating heart) ----
  const hotel = new THREE.Group();
  const hBody = new THREE.Mesh(
    new THREE.BoxGeometry(8, 17, 5.5),
    new THREE.MeshStandardMaterial({ color: '#7fa8a0', roughness: 0.85 })
  );
  hBody.position.y = 8.5;
  hBody.castShadow = true;
  const hRoof = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 1, 6.1),
    new THREE.MeshStandardMaterial({ color: '#5d827b' })
  );
  hRoof.position.y = 17.5;
  hotel.add(hBody, hRoof);
  const heart = makeEmojiSprite('💗', 4.5);
  heart.position.y = 22;
  hotel.add(heart);
  hotel.position.set(LANDMARKS.hotel[0], 0, LANDMARKS.hotel[1]);
  group.add(hotel);

  // ---- Lou Malnati's: brick pizzeria with green awnings + sign ----
  const lou = new THREE.Group();
  const louBrick = new THREE.MeshStandardMaterial({ color: '#8f4a38', roughness: 0.9 });
  const louGreen = new THREE.MeshStandardMaterial({ color: '#1d5c3a', roughness: 0.8 });
  const louBody = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 7), louBrick);
  louBody.position.y = 2.5;
  louBody.castShadow = true;
  const louTrim = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.4, 7.4), louGreen);
  louTrim.position.y = 5.1;
  lou.add(louBody, louTrim);
  // sign band with the name, facing the street (south)
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 72;
  const sctx = signCanvas.getContext('2d');
  sctx.fillStyle = '#1d5c3a';
  sctx.fillRect(0, 0, 512, 72);
  sctx.strokeStyle = '#f5e9c8';
  sctx.lineWidth = 4;
  sctx.strokeRect(6, 6, 500, 60);
  sctx.fillStyle = '#f5e9c8';
  sctx.font = 'bold 34px Georgia, serif';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText("LOU MALNATI'S", 256, 38);
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  for (const [sz, ry] of [
    [3.53, 0],
    [-3.53, Math.PI],
  ]) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 0.9),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(0, 4.2, sz);
    sign.rotation.y = ry;
    lou.add(sign);
  }
  // glowing windows + striped awnings on the south face
  const louWin = new THREE.MeshStandardMaterial({
    color: '#5a4a3a',
    emissive: '#ffc978',
    emissiveIntensity: 0.5,
    roughness: 0.5,
  });
  for (let i = 0; i < 3; i++) {
    const wx = -2.2 + i * 2.2;
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 0.12), louWin);
    win.position.set(wx, 1.5, 3.53);
    lou.add(win);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.1), louGreen);
    awning.position.set(wx, 2.6, 3.9);
    awning.rotation.x = 0.42;
    lou.add(awning);
  }
  // little pizza sign on a pole at the corner
  const louPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 4.4, 6),
    new THREE.MeshStandardMaterial({ color: '#3c4046' })
  );
  louPole.position.set(4.1, 2.2, 3.8);
  lou.add(louPole);
  const pizzaSign = makeEmojiSprite('🍕', 2.2);
  pizzaSign.position.set(4.1, 4.7, 3.8);
  lou.add(pizzaSign);
  lou.position.set(LANDMARKS.lou[0], 0, LANDMARKS.lou[1]);
  group.add(lou);

  // ---- Volare Ristorante Italiano: warm stucco trattoria + patio ----
  const volare = new THREE.Group();
  const stucco = new THREE.MeshStandardMaterial({ color: '#d9a86a', roughness: 0.9 });
  const volRoofMat = new THREE.MeshStandardMaterial({ color: '#8a3b2e', roughness: 0.85 });
  const volBody = new THREE.Mesh(new THREE.BoxGeometry(6.5, 5.5, 6.5), stucco);
  volBody.position.y = 2.75;
  volBody.castShadow = true;
  const volRoof = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.5, 7.1), volRoofMat);
  volRoof.position.y = 5.7;
  volare.add(volBody, volRoof);
  // green-white-red Italian awning band on the south face
  const volAwning = [
    ['#1d7d4c', -1.9],
    ['#f2efe6', 0],
    ['#c23b2e', 1.9],
  ];
  for (const [col, ox] of volAwning) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.12, 1.2),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 })
    );
    strip.position.set(ox, 2.9, 3.55);
    strip.rotation.x = 0.42;
    volare.add(strip);
  }
  // sign
  const volSignCanvas = document.createElement('canvas');
  volSignCanvas.width = 512;
  volSignCanvas.height = 84;
  const vctx = volSignCanvas.getContext('2d');
  vctx.fillStyle = '#5a2018';
  vctx.fillRect(0, 0, 512, 84);
  vctx.fillStyle = '#f5e9c8';
  vctx.font = 'italic bold 46px Georgia, serif';
  vctx.textAlign = 'center';
  vctx.textBaseline = 'middle';
  vctx.fillText('Volare', 256, 44);
  const volSignTex = new THREE.CanvasTexture(volSignCanvas);
  volSignTex.colorSpace = THREE.SRGBColorSpace;
  for (const [sz, ry] of [
    [3.28, 0],
    [-3.28, Math.PI],
  ]) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 0.82),
      new THREE.MeshBasicMaterial({ map: volSignTex })
    );
    sign.position.set(0, 4.4, sz);
    sign.rotation.y = ry;
    volare.add(sign);
  }
  // glowing windows
  const volWin = new THREE.MeshStandardMaterial({
    color: '#5a4a3a',
    emissive: '#ffcf8a',
    emissiveIntensity: 0.5,
    roughness: 0.5,
  });
  for (const [wx, wz, ry] of [
    [-1.8, 3.28, 0],
    [1.8, 3.28, 0],
    [3.28, -1.6, Math.PI / 2],
    [3.28, 1.6, Math.PI / 2],
  ]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.7, 0.12), volWin);
    win.position.set(wx, 1.6, wz);
    win.rotation.y = ry;
    volare.add(win);
  }
  // little patio: two umbrella tables out front
  for (const px of [-2.2, 2.2]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.5, 5),
      new THREE.MeshStandardMaterial({ color: '#8a8f96' })
    );
    pole.position.set(px, 0.75, 5);
    const umb = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: '#c23b2e', roughness: 0.7 })
    );
    umb.position.set(px, 1.65, 5);
    volare.add(pole, umb);
  }
  const volPasta = makeEmojiSprite('🍝', 2);
  volPasta.position.set(0, 7.2, 0);
  volare.add(volPasta);
  volare.position.set(LANDMARKS.volare[0], 0, LANDMARKS.volare[1]);
  group.add(volare);

  // ---- Starbucks Reserve Roastery: curved glass corner tower, glowing casks ----
  const sbux = new THREE.Group();
  const sbWhite = new THREE.MeshStandardMaterial({ color: '#eef0f0', roughness: 0.6, metalness: 0.1 });
  const sbGlass = new THREE.MeshStandardMaterial({
    color: '#a98a63',
    emissive: '#ff9e52',
    emissiveIntensity: 0.32,
    roughness: 0.2,
    metalness: 0.3,
  });
  // glowing glass core (the warm roastery interior)
  const sbCore = new THREE.Mesh(new THREE.BoxGeometry(8.4, 15, 8.4), sbGlass);
  sbCore.position.y = 7.5;
  sbCore.castShadow = true;
  sbux.add(sbCore);
  // white floor ledges wrapping the tower
  for (const y of [0.2, 3.9, 7.6, 11.3, 15]) {
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.34, 8.9), sbWhite);
    ledge.position.y = y;
    sbux.add(ledge);
  }
  // white corner piers
  for (const [px, pz] of [
    [4.25, 4.25],
    [4.25, -4.25],
    [-4.25, 4.25],
    [-4.25, -4.25],
  ]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 15, 0.5), sbWhite);
    pier.position.set(px, 7.5, pz);
    sbux.add(pier);
  }
  // rooftop terrace with umbrellas
  const sbRoof = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: '#7fae6a', roughness: 1 })
  );
  sbRoof.position.y = 15.2;
  sbux.add(sbRoof);
  for (const [ux, uz] of [
    [-2.6, -2.6],
    [2.6, -2.6],
    [-2.6, 2.6],
  ]) {
    const upole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 5), sbWhite);
    upole.position.set(ux, 15.8, uz);
    const ucanopy = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: '#8a3b2e', roughness: 0.7 })
    );
    ucanopy.position.set(ux, 16.5, uz);
    sbux.add(upole, ucanopy);
  }

  // the signature rounded glass corner tower, at the SE corner facing the plaza
  const sbTower = new THREE.Group();
  const towerGlass = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 16.5, 20), sbGlass);
  towerGlass.position.y = 8.25;
  sbTower.add(towerGlass);
  // white floor rings on the tower
  for (const y of [3.9, 7.6, 11.3]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.78, 2.78, 0.34, 20), sbWhite);
    ring.position.y = y;
    sbTower.add(ring);
  }
  // curved white sign band + STARBUCKS RESERVE lettering
  const sbSignCanvas = document.createElement('canvas');
  sbSignCanvas.width = 1024;
  sbSignCanvas.height = 128;
  const sbctx = sbSignCanvas.getContext('2d');
  sbctx.fillStyle = '#eef0f0';
  sbctx.fillRect(0, 0, 1024, 128);
  sbctx.fillStyle = '#1a1a1a';
  sbctx.font = 'bold 62px Arial, sans-serif';
  sbctx.textAlign = 'center';
  sbctx.textBaseline = 'middle';
  sbctx.fillText('STARBUCKS RESERVE', 512, 70);
  const sbSignTex = new THREE.CanvasTexture(sbSignCanvas);
  sbSignTex.colorSpace = THREE.SRGBColorSpace;
  const thetaLen = 2.2;
  const signBand = new THREE.Mesh(
    new THREE.CylinderGeometry(2.82, 2.82, 1.5, 24, 1, true, -thetaLen / 2, thetaLen),
    new THREE.MeshBasicMaterial({ map: sbSignTex, side: THREE.DoubleSide })
  );
  signBand.position.y = 14.4;
  signBand.rotation.y = -Math.PI / 4; // face the SE corner
  sbTower.add(signBand);
  // domed white cap
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(2.9, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    sbWhite
  );
  cap.position.y = 16.5;
  sbTower.add(cap);
  // gold siren medallion on the cap, facing SE
  const medallion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.16, 16),
    new THREE.MeshStandardMaterial({ color: '#d9b154', emissive: '#8a6a1e', emissiveIntensity: 0.4, metalness: 0.7, roughness: 0.3 })
  );
  medallion.rotation.set(Math.PI / 2, 0, 0);
  medallion.rotation.z = Math.PI / 4;
  medallion.position.set(1.9, 18.2, 1.9);
  sbTower.add(medallion);
  // flag pole + flag on top
  const sbFlagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4, 5), sbWhite);
  sbFlagPole.position.set(0, 20.5, 0);
  const sbFlag = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.9),
    new THREE.MeshBasicMaterial({ color: '#0a6b3f', side: THREE.DoubleSide })
  );
  sbFlag.position.set(0.75, 21.7, 0);
  sbTower.add(sbFlagPole, sbFlag);
  sbTower.position.set(4.2, 0, 4.2);
  sbux.add(sbTower);

  sbux.position.set(LANDMARKS.starbucks[0], 0, LANDMARKS.starbucks[1]);
  group.add(sbux);

  // ---- Apple Michigan Avenue: glass pavilion, floating MacBook roof ----
  const apple = new THREE.Group();
  const plaza = new THREE.Mesh(
    new THREE.BoxGeometry(9.5, 0.14, 4.6),
    new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: 0.9 })
  );
  plaza.position.y = 0.07;
  apple.add(plaza);
  // two shallow steps down toward the riverwalk
  for (const [sz, sy] of [
    [-2.55, 0.09],
    [-2.95, 0.04],
  ]) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.08, 0.5),
      new THREE.MeshStandardMaterial({ color: '#cfc8b8', roughness: 0.9 })
    );
    step.position.set(0, sy, sz);
    apple.add(step);
  }
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(7, 2.6, 3.1),
    new THREE.MeshStandardMaterial({
      color: '#bfe0ea',
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0.1,
    })
  );
  glass.position.y = 1.44;
  const interior = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 2.1, 2.4),
    new THREE.MeshStandardMaterial({
      color: '#e8d9c2',
      emissive: '#ffc978',
      emissiveIntensity: 0.55,
      roughness: 0.8,
    })
  );
  interior.position.y = 1.2;
  const appleRoof = new THREE.Mesh(
    new RoundedBoxGeometry(8.8, 0.32, 4.6, 2, 0.16),
    new THREE.MeshStandardMaterial({ color: '#dcd9d2', roughness: 0.35, metalness: 0.25 })
  );
  appleRoof.position.y = 2.95;
  apple.add(glass, interior, appleRoof);
  const logoTex = new THREE.CanvasTexture(appleLogoCanvas(128, '#ffffff'));
  logoTex.colorSpace = THREE.SRGBColorSpace;
  const appleLogo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: logoTex, transparent: true, depthWrite: false })
  );
  appleLogo.scale.setScalar(1.05);
  appleLogo.position.set(0, 1.7, 1.8);
  apple.add(appleLogo);
  apple.position.set(LANDMARKS.apple[0], 0, LANDMARKS.apple[1]);
  group.add(apple);

  // ---- 3 Arts Club: red-brick landmark with stone arches + courtyard tree ----
  const arts = new THREE.Group();
  const brickMat = new THREE.MeshStandardMaterial({ color: '#9a5741', roughness: 0.9 });
  const brickDark = new THREE.MeshStandardMaterial({ color: '#7f4634', roughness: 0.9 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: '#dccdaa', roughness: 0.8 });
  const artsBody = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 10), brickMat);
  artsBody.position.y = 4.5;
  artsBody.castShadow = true;
  arts.add(artsBody);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.5, 10.8), brickDark);
  cornice.position.y = 9.15;
  arts.add(cornice);
  for (const [cx, cz] of [
    [-3.8, -4.8],
    [3.8, -4.8],
    [-3.8, 4.8],
    [3.8, 4.8],
  ]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.7, 0.8), brickDark);
    pier.position.set(cx, 4.85, cz);
    arts.add(pier);
  }
  // stone arched windows along the south face (facing the street)
  for (let i = 0; i < 4; i++) {
    const ax = -3 + i * 2;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.7, 0.16), stoneMat);
    frame.position.set(ax, 1.25, 5.06);
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 10), stoneMat);
    arch.rotation.x = Math.PI / 2;
    arch.position.set(ax, 2.1, 5.06);
    arts.add(frame, arch);
  }
  // upper windows grid (south + east faces)
  const winMat3 = new THREE.MeshStandardMaterial({
    color: '#37454f',
    emissive: '#ffd98a',
    emissiveIntensity: 0.12,
    roughness: 0.4,
  });
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.1), winMat3);
      w1.position.set(-3 + col * 2, 4.4 + row * 2.2, 5.06);
      arts.add(w1);
    }
    for (let col = 0; col < 4; col++) {
      const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 0.85), winMat3);
      w2.position.set(4.06, 4.4 + row * 2.2, -3.4 + col * 2.3);
      arts.add(w2);
    }
  }
  // grand stone entry on the south face
  const entry = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.4, 0.3), stoneMat);
  entry.position.set(0, 1.2, 5.1);
  const entryArch = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.3, 12), stoneMat);
  entryArch.rotation.x = Math.PI / 2;
  entryArch.position.set(0, 2.4, 5.1);
  arts.add(entry, entryArch);
  // the famous courtyard — a big tree peeking over the roofline
  const courtTree = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.9, 0),
    new THREE.MeshStandardMaterial({ color: '#5f9e55', roughness: 1, flatShading: true })
  );
  courtTree.position.set(0.5, 10.1, -0.5);
  arts.add(courtTree);
  arts.position.set(LANDMARKS.artsClub[0], 0, LANDMARKS.artsClub[1]);
  group.add(arts);

  // ---- tiny Bean ----
  const bean = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 20, 14),
    new THREE.MeshStandardMaterial({ color: '#e8edf2', metalness: 0.4, roughness: 0.15 })
  );
  bean.scale.set(1.7, 1, 1);
  bean.position.set(LANDMARKS.bean[0], 1.7, LANDMARKS.bean[1]);
  group.add(bean);

  // ---- architecture tour boat (white two-decker, like the real ones) ----
  const boat = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: '#f7f5ef', roughness: 0.55 });
  const trim = new THREE.MeshStandardMaterial({ color: '#c8952e', roughness: 0.6 });
  const navy = new THREE.MeshStandardMaterial({ color: '#1d3a5f', roughness: 0.7 });

  // hull with pointed bow (box + cone-ish prow)
  const hull = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.1, 3), white);
  hull.position.y = 0.55;
  // triangular prism prow — one vertex pointing forward (+x)
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.1, 3, 1), white);
  bow.position.set(5.2, 0.55, 0);
  bow.rotation.y = -Math.PI / 2;
  const waterline = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.25, 3.05), navy);
  waterline.position.y = 0.13;
  boat.add(hull, bow, waterline);

  // hull name — canvas texture plane on both sides
  const nameCanvas = document.createElement('canvas');
  nameCanvas.width = 256;
  nameCanvas.height = 48;
  const nctx = nameCanvas.getContext('2d');
  nctx.fillStyle = '#1d3a5f';
  nctx.font = 'bold 30px Georgia, serif';
  nctx.textAlign = 'center';
  nctx.textBaseline = 'middle';
  nctx.fillText(C.boatHullName, 128, 26);
  const nameTex = new THREE.CanvasTexture(nameCanvas);
  nameTex.colorSpace = THREE.SRGBColorSpace;
  for (const side of [1, -1]) {
    const name = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 0.55),
      new THREE.MeshBasicMaterial({ map: nameTex, transparent: true })
    );
    name.position.set(2.6, 0.62, side * 1.53);
    name.rotation.y = side > 0 ? 0 : Math.PI;
    boat.add(name);
  }

  // lower enclosed deck with a band of windows
  const lower = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.15, 2.6), white);
  lower.position.set(-0.6, 1.65, 0);
  const winBand = new THREE.Mesh(
    new THREE.BoxGeometry(6.9, 0.55, 2.65),
    new THREE.MeshStandardMaterial({ color: '#37505f', roughness: 0.2, metalness: 0.3 })
  );
  winBand.position.set(-0.6, 1.75, 0);
  boat.add(lower, winBand);

  // upper open deck with wood floor + white railing posts
  const upper = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.25, 2.8), trim);
  upper.position.set(-0.6, 2.35, 0);
  boat.add(upper);
  const railMat = white;
  for (const side of [1.32, -1.32]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.08, 0.08), railMat);
    rail.position.set(-0.6, 3.15, side);
    boat.add(rail);
    for (let px = -4; px <= 3; px++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 4), railMat);
      post.position.set(-0.6 + px, 2.8, side);
      boat.add(post);
    }
  }
  const railBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.72), railMat);
  railBack.position.set(-4.4, 3.15, 0);
  boat.add(railBack);

  // little passengers on the upper deck
  const passengerColors = ['#ff8fab', '#6ea8fe', '#ffd166', '#8fd3c7', '#c9a6f0', '#f4a261'];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const p = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.16, 0.24, 3, 6),
        new THREE.MeshStandardMaterial({
          color: passengerColors[(row * 4 + col) % passengerColors.length],
          roughness: 0.8,
        })
      );
      p.position.set(-2.8 + row * 1.4, 2.75, -0.85 + col * 0.57);
      boat.add(p);
    }
  }

  // wheelhouse at the stern + flag at the bow
  const wheelhouse = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 2), white);
  wheelhouse.position.set(-3.4, 2.95, 0);
  boat.add(wheelhouse);
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 4), railMat);
  flagPole.position.set(4.6, 1.7, 0);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.45),
    new THREE.MeshBasicMaterial({ color: '#e63b60', side: THREE.DoubleSide })
  );
  flag.position.set(4.25, 2.2, 0);
  boat.add(flagPole, flag);

  boat.position.set(LANDMARKS.boatDock[0], 0.25, LANDMARKS.boatDock[1]);
  scene.add(boat);

  let t = 0;
  return {
    boat,
    group,
    update(dt) {
      t += dt;
      heart.position.y = 22 + Math.sin(t * 1.8) * 0.7;
    },
  };
}
