// Timeline state machine: drives the couple (walking, boat, L train, Uber),
// the camera rig, day/night blending, the celebration beat, and the finale that
// ends with fireworks in the sky over Lake Michigan.
import * as THREE from 'three';
import { STOPS, FINALE_WAYPOINTS, CELEBRATION_STOP_INDEX } from './itinerary.js';
import { LANDMARKS, L_STATIONS, TRACK_Y, BRIDGE_XS } from './cityData.js';
import { makeMarkerSprite, appleLogoCanvas, tourBoatCanvas } from './sprites.js';
import { parkTrainCars } from './vehicles.js';
import { C } from '../content.js';

const MARKER_LOGOS = {
  apple: () => appleLogoCanvas(96, '#3a3a3c'),
  boat: () => tourBoatCanvas(96),
};

const STOP_DWELL = 4;
const DEFAULT_OFFSET = new THREE.Vector3(28, 38, 28);
const RIDE_OFFSETS = {
  boat: new THREE.Vector3(20, 22, 28),
  train: new THREE.Vector3(22, 18, 30),
  car: new THREE.Vector3(15, 11, 19),
};
const CELEBRATION_OFFSET = new THREE.Vector3(14, 52, 66);
const CELEBRATION_HOLD = 6;
const FINALE_TARGET = new THREE.Vector3(45, 20, 5);
const FINALE_OFFSET = new THREE.Vector3(-100, 4, 0);

const MODE_SPEED = { walk: 7, boat: 16, train: 20, car: 15 };
const MODE_CLAMP = { walk: [3.5, 9], boat: [12, 24], train: [5, 9], car: [4, 8] };
const MODE_LOOP = { walk: 'steps', boat: 'boat', train: 'train', car: 'car' };

// walking height: on a closed drawbridge deck the couple stands on top of it
function walkY(x, z) {
  if (Math.abs(z) < 6.2) {
    for (const bx of BRIDGE_XS) {
      if (Math.abs(x - bx) < 2.6) return 0.4;
    }
  }
  return 0;
}

function toCurve(points, y = 0) {
  return new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, y, z)),
    false,
    'catmullrom',
    0.25
  );
}

export class Playback {
  constructor({
    scene,
    camera,
    canvas,
    couple,
    vehicles, // { boat, train, car }
    ferrisSeat, // rotating anchor on the Navy Pier wheel
    daynight,
    effects,
    hud,
    audio,
    occluders = [],
  }) {
    Object.assign(this, {
      scene,
      camera,
      canvas,
      couple,
      vehicles,
      ferrisSeat,
      daynight,
      effects,
      hud,
      audio,
      occluders,
    });

    // legs[i] = travel segments from stop i-1 to stop i
    this.legs = [];
    for (let i = 1; i < STOPS.length; i++) {
      const segments = STOPS[i].leg.map((seg) => {
        const curve = toCurve(seg.points, seg.mode === 'train' ? TRACK_Y + 0.3 : 0);
        const len = curve.getLength();
        const [lo, hi] = MODE_CLAMP[seg.mode];
        return {
          mode: seg.mode,
          curve,
          length: len,
          duration: THREE.MathUtils.clamp(len / MODE_SPEED[seg.mode], lo, hi),
        };
      });
      const total = segments.reduce((s, seg) => s + seg.duration, 0);
      this.legs[i] = { segments, total };
    }
    this.finaleCurve = toCurve(FINALE_WAYPOINTS);

    // "stroll" stops: the couple slowly walks a path during the stop itself
    this.strolls = {};
    STOPS.forEach((s, i) => {
      if (s.stroll) {
        const curve = toCurve(s.stroll);
        const len = curve.getLength();
        this.strolls[i] = { curve, duration: len / 3.2 }; // leisurely pace
      }
    });

    // state
    this.mode = 'stop';
    this.stopIndex = 0;
    this.destIndex = 0;
    this.segIndex = 0;
    this.segTime = 0;
    this.stopTimer = STOP_DWELL;
    this.playing = true;
    this.celebrationFired = false;
    this.celebrationTime = 0;
    this.finaleTime = 0;
    this.endTimer = 0;
    this.closingShown = false;
    this.travelFromSky = null;
    this.activeLoop = null;
    this.boomTimer = 0;

    // camera rig
    this.camTarget = new THREE.Vector3();
    this.camOffset = DEFAULT_OFFSET.clone();
    this.desiredOffset = DEFAULT_OFFSET.clone();
    this.desiredTarget = new THREE.Vector3();

    // scratch
    this._pos = new THREE.Vector3();
    this._tan = new THREE.Vector3();
    this._scratch = new THREE.Vector3();

    // stop markers
    this.markers = STOPS.map((s, i) => {
      const logo = MARKER_LOGOS[s.logo] ? MARKER_LOGOS[s.logo]() : null;
      const sprite = makeMarkerSprite(s.emoji, 6.5, i, logo);
      // 360's marker rides higher up the tower; hotelNight floats above 🏨
      const markerY = s.id === '360' ? 15 : s.id === 'hotelNight' ? 13.5 : 9;
      // markerPos lets the icon hover over the building while the couple stands nearby
      const mp = s.markerPos || s.pos;
      sprite.position.set(mp[0], markerY, mp[1]);
      sprite.userData.stopIndex = i;
      sprite.userData.baseY = sprite.position.y;
      scene.add(sprite);
      return sprite;
    });
    this.raycaster = new THREE.Raycaster();
    this.raycaster.camera = camera; // required for Sprite raycasting
    this.pointer = new THREE.Vector2();
    canvas.addEventListener('click', (e) => this._onClick(e));
    // pointer cursor over clickable markers (throttled raycast)
    let hoverThrottle = 0;
    canvas.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - hoverThrottle < 120) return;
      hoverThrottle = now;
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObjects(this.markers, false).length > 0;
      canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    this.time = 0;
    this.liftY = 0;
    this._occlusionTimer = 0;
  }

  begin() {
    this._placeAtStop(0, { snapCamera: true });
  }

  isCruising() {
    return (
      this.mode === 'travel' &&
      this.legs[this.destIndex]?.segments[this.segIndex]?.mode === 'boat'
    );
  }

  // ---------- controls ----------
  togglePlay() {
    this.playing = !this.playing;
    this.hud.setPlaying(this.playing);
    if (!this.playing) this.audio.stopLoops();
    else if (this.mode === 'travel') this._setTravelAudio();
  }

  next() {
    if (this.mode === 'stop') this._depart();
    else if (this.mode === 'travel') this.jumpTo(this.destIndex);
    else if (this.mode === 'celebration') this._endCelebrationBeat();
  }

  prev() {
    if (this.mode === 'stop' && this.stopIndex > 0) this.jumpTo(this.stopIndex - 1);
    else if (this.mode === 'travel') this.jumpTo(Math.max(this.destIndex - 1, 0));
    else if (this.mode === 'celebration') this.jumpTo(CELEBRATION_STOP_INDEX - 1);
    else if (this.mode === 'finale' || this.mode === 'end') {
      this._leaveEnd();
      this.jumpTo(STOPS.length - 1);
    }
  }

  replay() {
    this._leaveEnd();
    this.effects.stopConfetti();
    this.celebrationFired = false;
    this.playing = true;
    this.hud.setPlaying(true);
    this.jumpTo(0);
  }

  jumpTo(i) {
    if (this.mode === 'finale' || this.mode === 'end') this._leaveEnd();
    this.mode = 'stop';
    this._placeAtStop(i, { snapCamera: false });
  }

  _leaveEnd() {
    this.hud.hideClosing();
    this.hud.hideBanner();
    this.effects.stopHearts();
    this.closingShown = false;
  }

  // ---------- internals ----------
  _placeAtStop(i, { snapCamera, arrived = false }) {
    const stop = STOPS[i];
    this.mode = 'stop';
    this.stopIndex = i;
    this.strollTime = 0;
    this.riding = stop.ride || null; // 'ferris' → ride the Navy Pier wheel
    // rides + strolls last longer than a normal stop
    this.stopTimer = this.riding
      ? 10
      : this.strolls[i]
        ? this.strolls[i].duration + 1.5
        : STOP_DWELL;
    // 'indoors' stops (sleeping at the hotel) hide the couple inside the building
    this.couple.group.visible = !stop.indoors;
    this.couple.group.scale.setScalar(1.35);
    // observation-deck stops place the couple high up on the tower
    if (stop.deck) {
      this.couple.group.position.set(stop.deck[0], stop.deck[1], stop.deck[2]);
    } else {
      this.couple.group.position.set(stop.pos[0], 0, stop.pos[1]);
    }
    this.couple.setHat(C.partyHat && stop.day === 2);
    this.daynight.blend(stop.sky, stop.sky, 0);
    this.hud.showStop(stop);
    this.hud.setDay(stop.day);
    this.hud.setCurrentDot(i);
    this._resetVehicles(i);
    this.audio.stopLoops();
    this.activeLoop = null;
    if (arrived) this.audio.sfx(stop.eat ? 'nom' : 'chime');
    this.desiredOffset.copy(
      stop.cameraOffset ? this._scratch.fromArray(stop.cameraOffset) : DEFAULT_OFFSET
    );
    this.desiredTarget.copy(this.couple.group.position);
    if (stop.day === 2 && this.celebrationFired) this.effects.setConfettiDensity(0.3);
    if (snapCamera) {
      this.camTarget.copy(this.desiredTarget);
      this.camOffset.copy(this.desiredOffset);
      this.camera.position.copy(this.camTarget).add(this.camOffset);
      this.camera.lookAt(this.camTarget);
    }
  }

  _resetVehicles(stopIndex) {
    const { boat, train, car } = this.vehicles;
    car.visible = false;
    boat.position.set(LANDMARKS.boatDock[0], 0.25, LANDMARKS.boatDock[1]);
    boat.rotation.set(0, 0, 0);
    const station = stopIndex >= 8 ? L_STATIONS[1] : L_STATIONS[0];
    parkTrainCars(train);
    train.position.set(station.pos[0], TRACK_Y + 0.3, station.pos[1]);
    train.rotation.set(0, station.pos[1] < 0 ? Math.PI / 2 : 0, 0);
  }

  _depart() {
    if (this.stopIndex === STOPS.length - 1) {
      this._startFinale();
    } else if (this.stopIndex === CELEBRATION_STOP_INDEX - 1 && !this.celebrationFired) {
      this._startCelebration();
    } else {
      this._startTravel(this.stopIndex + 1);
    }
  }

  _startTravel(dest) {
    this.mode = 'travel';
    this.destIndex = dest;
    this.segIndex = 0;
    this.segTime = 0;
    this.hud.hideCard();
    this.hud.setCurrentDot(dest);
    this._setTravelAudio();
  }

  _setTravelAudio() {
    const seg = this.legs[this.destIndex]?.segments[this.segIndex];
    if (!seg) return;
    const loop = MODE_LOOP[seg.mode];
    if (loop !== this.activeLoop) {
      this.audio.startLoop(loop);
      this.activeLoop = loop;
    }
  }

  _startCelebration() {
    this.mode = 'celebration';
    this.celebrationFired = true;
    this.celebrationTime = 0;
    this.boomTimer = 0.3;
    this.hud.hideCard();
    this.hud.setDay(2); // flip the day chip as the banner appears
    this.hud.showBanner();
    this.couple.setHat(C.partyHat);
    this.audio.stopLoops();
    this.activeLoop = null;
    this.effects.startFireworkShow(-20, -30);
    this.effects.startConfetti();
    this.effects.setConfettiDensity(1);
  }

  _endCelebrationBeat() {
    this.travelFromSky = 'dawn';
    this.effects.setConfettiDensity(0.3);
    this._startTravel(CELEBRATION_STOP_INDEX);
  }

  _startFinale() {
    this.mode = 'finale';
    this.finaleTime = 0;
    this.finaleDuration = 10;
    this.hud.hideCard();
    this.audio.stopLoops();
    this.audio.startLoop('steps');
    this.activeLoop = 'steps';
  }

  _startEnd() {
    this.mode = 'end';
    this.endTimer = 0;
    this.closingShown = false;
    this.boomTimer = 0.5;
    this.audio.stopLoops();
    this.activeLoop = null;
    this.daynight.blend('sunset', 'sunset', 0);
    this.hud.showBanner({ sticky: true, text: C.hud.finaleBanner || C.hud.banner });
    this.effects.startFireworkShow(70, -5);
    this.effects.startHearts(this.couple.group.position);
    // camera: turn east — sky and Lake Michigan, couple silhouetted below
    this.desiredTarget.copy(FINALE_TARGET);
    this.desiredOffset.copy(FINALE_OFFSET);
  }

  _onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.markers, false);
    if (hits.length) this.jumpTo(hits[0].object.userData.stopIndex);
  }

  // ---------- per-frame ----------
  update(dt) {
    this.time += dt;

    // markers bob; the current one pulses bigger
    const current = this.mode === 'travel' ? this.destIndex : this.stopIndex;
    for (const m of this.markers) {
      const i = m.userData.stopIndex;
      m.position.y = m.userData.baseY + Math.sin(this.time * 2 + i) * 0.5;
      const pulse = i === current ? 1.12 + Math.sin(this.time * 3.5) * 0.08 : 1;
      m.scale.setScalar(6.5 * pulse);
    }

    let walking = false;

    if (this.playing) {
      if (this.mode === 'stop') {
        // stroll stops: keep walking slowly while the card is up
        const stroll = this.strolls[this.stopIndex];
        if (stroll) {
          this.strollTime += dt;
          const u = Math.min(this.strollTime / stroll.duration, 1);
          stroll.curve.getPointAt(u, this._pos);
          stroll.curve.getTangentAt(Math.min(u, 0.999), this._tan);
          this.couple.group.position.set(this._pos.x, 0, this._pos.z);
          this.couple.face(this._tan);
          this.desiredTarget.copy(this.couple.group.position);
          this.desiredOffset.set(14, 12, -20); // from across the river, low & close
          walking = u < 1;
          if (walking && this.activeLoop !== 'steps') {
            this.audio.startLoop('steps');
            this.activeLoop = 'steps';
          } else if (!walking && this.activeLoop === 'steps') {
            this.audio.stopLoops();
            this.activeLoop = null;
          }
        }
        // ferris-wheel ride: sit the couple on the rotating seat, frame the wheel
        if (this.riding === 'ferris' && this.ferrisSeat) {
          this.ferrisSeat.getWorldPosition(this._pos);
          this.couple.group.position.copy(this._pos);
          this.couple.group.scale.setScalar(0.9);
          this._tan.set(0, 0, 1); // face out toward the lake/skyline
          this.couple.face(this._tan);
          this.desiredTarget.set(76, 8, -16);
        }
        this.stopTimer -= dt;
        if (this.stopTimer <= 0) this._depart();
      } else if (this.mode === 'travel') {
        walking = this._updateTravel(dt);
      } else if (this.mode === 'celebration') {
        this._updateCelebration(dt);
      } else if (this.mode === 'finale') {
        walking = this._updateFinale(dt);
      } else if (this.mode === 'end') {
        this._updateEnd(dt);
      }
    }

    this.couple.update(dt, walking && this.playing);

    // camera auto-lift: if a building sits between camera and couple, rise
    this._occlusionTimer -= dt;
    if (this._occlusionTimer <= 0 && this.occluders.length && this.mode !== 'end') {
      this._occlusionTimer = 0.35;
      const from = this.camera.position;
      const to = this._scratch.copy(this.desiredTarget).setY(this.desiredTarget.y + 3);
      const dir = to.clone().sub(from);
      const dist = dir.length();
      this.raycaster.set(from, dir.normalize());
      this.raycaster.far = dist - 3;
      const blocked = this.raycaster.intersectObjects(this.occluders, true).length > 0;
      this.liftY = THREE.MathUtils.clamp(this.liftY + (blocked ? 8 : -6), 0, 38);
      this.raycaster.far = Infinity;
    }

    // smooth camera
    const k = 1 - Math.exp(-dt * 2.2);
    this.camTarget.lerp(this.desiredTarget, k);
    this.camOffset.lerp(
      this._scratch.copy(this.desiredOffset).setY(this.desiredOffset.y + this.liftY),
      k
    );
    this.camera.position.copy(this.camTarget).add(this.camOffset);
    this.camera.lookAt(this.camTarget.x, this.camTarget.y + 2, this.camTarget.z);
  }

  _updateTravel(dt) {
    const leg = this.legs[this.destIndex];
    const seg = leg.segments[this.segIndex];
    this.segTime += dt;
    const u = Math.min(this.segTime / seg.duration, 1);

    seg.curve.getPointAt(u, this._pos);
    seg.curve.getTangentAt(Math.min(u, 0.999), this._tan);

    let walking = false;
    if (seg.mode === 'walk') {
      this.couple.group.visible = true;
      this.couple.group.position.set(this._pos.x, walkY(this._pos.x, this._pos.z), this._pos.z);
      this.couple.face(this._tan);
      const destStop = STOPS[this.destIndex];
      this.desiredOffset.copy(
        destStop.cameraOffset && u > 0.6
          ? this._scratch.fromArray(destStop.cameraOffset)
          : DEFAULT_OFFSET
      );
      walking = true;
    } else {
      const vehicle = this.vehicles[seg.mode];
      vehicle.visible = true;
      const rotY = Math.atan2(-this._tan.z, this._tan.x);
      if (seg.mode === 'boat') {
        vehicle.position.set(this._pos.x, 0.25, this._pos.z);
        vehicle.rotation.set(0, rotY, Math.sin(this.time * 2) * 0.03);
        // the couple stands at the bow — king of the world!
        this.couple.group.visible = true;
        this.couple.group.position
          .set(this._pos.x, 1.35, this._pos.z)
          .addScaledVector(this._scratch.copy(this._tan).setY(0).normalize(), 3.1);
        this.couple.face(this._tan);
      } else if (seg.mode === 'train') {
        // each car follows the curve at its own arc-length offset so the
        // train hugs the track through corners instead of swinging wide
        vehicle.position.set(0, 0, 0);
        vehicle.rotation.set(0, 0, 0);
        vehicle.userData.cars.forEach((car, idx) => {
          const uc = THREE.MathUtils.clamp(
            u + (idx === 0 ? 4.1 : -4.1) / seg.length,
            0,
            1
          );
          seg.curve.getPointAt(uc, this._scratch);
          car.position.copy(this._scratch);
          seg.curve.getTangentAt(Math.min(uc, 0.999), this._scratch);
          car.rotation.y = Math.atan2(-this._scratch.z, this._scratch.x);
        });
        this.couple.group.visible = false; // riding inside
      } else if (seg.mode === 'car') {
        vehicle.position.set(this._pos.x, 0, this._pos.z);
        vehicle.rotation.set(0, rotY, 0);
        this.couple.group.visible = true;
        this.couple.group.scale.setScalar(0.9); // tucked in the back seat
        this.couple.group.position
          .set(this._pos.x, 0.45, this._pos.z)
          .addScaledVector(this._scratch.copy(this._tan).setY(0).normalize(), -0.95);
        this.couple.face(this._tan);
      }
      this.desiredOffset.copy(RIDE_OFFSETS[seg.mode]);
    }
    this.desiredTarget.copy(
      seg.mode === 'train' ? this._pos : this.couple.group.position
    );

    // sky blend across the whole leg
    const elapsed =
      leg.segments.slice(0, this.segIndex).reduce((s, sg) => s + sg.duration, 0) + this.segTime;
    const fromSky = this.travelFromSky || STOPS[this.destIndex - 1].sky;
    this.daynight.blend(fromSky, STOPS[this.destIndex].sky, Math.min(elapsed / leg.total, 1));

    if (u >= 1) {
      this.segTime = 0;
      this.segIndex++;
      if (this.segIndex >= leg.segments.length) {
        this.travelFromSky = null;
        this._placeAtStop(this.destIndex, { snapCamera: false, arrived: true });
      } else {
        this._setTravelAudio();
      }
    }
    return walking;
  }

  _updateCelebration(dt) {
    this.celebrationTime += dt;
    this.daynight.blend('night', 'dawn', Math.min(this.celebrationTime / 2.5, 1));
    this.desiredOffset.copy(CELEBRATION_OFFSET);
    this.desiredTarget.set(-20, 6, -25);
    this.boomTimer -= dt;
    if (this.boomTimer <= 0 && this.celebrationTime < 5) {
      this.audio.sfx('boom');
      this.boomTimer = 0.5 + Math.random() * 0.5;
    }
    if (this.celebrationTime >= CELEBRATION_HOLD) this._endCelebrationBeat();
  }

  _updateFinale(dt) {
    this.finaleTime += dt;
    const u = Math.min(this.finaleTime / this.finaleDuration, 1);

    this.finaleCurve.getPointAt(u, this._pos);
    this.finaleCurve.getTangentAt(Math.min(u, 0.999), this._tan);
    this.couple.group.position.set(this._pos.x, walkY(this._pos.x, this._pos.z), this._pos.z);
    this.couple.face(this._tan);

    this.daynight.blend('day', 'sunset', u);
    this.desiredTarget.copy(this.couple.group.position);

    if (u >= 1) this._startEnd();
    return u < 1;
  }

  _updateEnd(dt) {
    this.endTimer += dt;
    // fireworks keep blooming over the lake
    if (this.endTimer % 3 < dt) {
      this.effects.startFireworkShow(55 + Math.random() * 35, -30 + Math.random() * 50);
    }
    this.boomTimer -= dt;
    if (this.boomTimer <= 0) {
      this.audio.sfx('boom');
      this.boomTimer = 0.7 + Math.random() * 0.8;
    }
    if (!this.closingShown && this.endTimer > 8) {
      this.closingShown = true;
      this.hud.showClosing();
    }
  }
}
