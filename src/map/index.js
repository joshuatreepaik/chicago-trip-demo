// MapScene: renderer, camera, module wiring, and the render loop.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildCity } from './city.js';
import { buildLake } from './lake.js';
import { buildBuildings } from './buildings.js';
import { buildLandmarks } from './landmarks.js';
import { buildCouple } from './couple.js';
import { buildDayNight } from './daynight.js';
import { buildEffects } from './effects.js';
import { buildHud } from './hud.js';
import { buildTrain, buildCar } from './vehicles.js';
import { Playback } from './playback.js';

export class MapScene {
  constructor(canvas, hudEl, audio) {
    this.canvas = canvas;
    this.hudEl = hudEl;
    this.audio = audio;
    this.built = false;
    this.running = false;
  }

  preload() {
    if (this.built) return;
    this.built = true;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.5,
      800
    );

    // post: gentle bloom makes night windows, lamps, and fireworks glow
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.32, // strength
      0.6, // radius
      0.82 // threshold
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.city = buildCity(this.scene);
    this.lake = buildLake(this.scene);
    this.buildings = buildBuildings(this.scene);
    this.landmarks = buildLandmarks(this.scene);
    this.couple = buildCouple(this.scene);
    this.effects = buildEffects(this.scene);
    this.daynight = buildDayNight(this.scene, {
      onWindows: (v) => this.buildings.setNight(v),
      onLamps: (v) => this.city.setLamps(v),
    });

    this.hud = buildHud(this.hudEl, {
      onPrev: () => this.playback.prev(),
      onNext: () => this.playback.next(),
      onTogglePlay: () => this.playback.togglePlay(),
      onJump: (i) => this.playback.jumpTo(i),
      onReplay: () => this.playback.replay(),
    });

    this.playback = new Playback({
      scene: this.scene,
      camera: this.camera,
      canvas: this.canvas,
      couple: this.couple,
      vehicles: {
        boat: this.landmarks.boat,
        train: buildTrain(this.scene),
        car: buildCar(this.scene),
      },
      daynight: this.daynight,
      effects: this.effects,
      hud: this.hud,
      audio: this.audio,
      occluders: [this.buildings.mesh, this.landmarks.group],
    });
    this.playback.begin();

    window.addEventListener('resize', () => this._resize());
    window.__map = this;

    // pre-compile shaders so the "Yes" transition is instant
    this.composer.render();
  }

  start() {
    this.preload();
    if (this.running) return;
    this.running = true;
    this.hud.showHint();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this._frame());
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.playback.update(dt);
    const boat = this.playback.vehicles.boat;
    this.city.update(dt, boat.position.x, boat.position.z, this.playback.isCruising());
    this.lake.update(dt);
    this.landmarks.update(dt);
    this.effects.update(dt);
    this.composer.render();
  }

  _resize() {
    if (!this.built) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
