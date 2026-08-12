// The L train and the Uber car the couple rides on day 2.
import * as THREE from 'three';
import { L_STATIONS, TRACK_Y } from './cityData.js';

export function buildTrain(scene) {
  const train = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#b9c3c9', roughness: 0.5, metalness: 0.3 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: '#8b5e3c', roughness: 0.7 });
  const winMat = new THREE.MeshStandardMaterial({
    color: '#274156',
    roughness: 0.2,
    metalness: 0.4,
  });

  const cars = [];
  for (let car = 0; car < 2; car++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.2, 2.3), bodyMat);
    body.position.y = 1.3;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.5, 2.35), stripeMat);
    stripe.position.y = 0.55;
    const windows = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.8, 2.4), winMat);
    windows.position.y = 1.7;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.25, 2.1), stripeMat);
    roof.position.y = 2.5;
    g.add(body, stripe, windows, roof);
    g.position.x = car === 0 ? 4.1 : -4.1;
    train.add(g);
    cars.push(g);
  }
  // each car follows the track curve independently (like real bogies),
  // so the playback code positions them via userData.cars during rides
  train.userData.cars = cars;
  train.visible = true;
  // park at the first station
  train.position.set(L_STATIONS[0].pos[0], TRACK_Y + 0.3, L_STATIONS[0].pos[1]);
  scene.add(train);
  return train;
}

export function parkTrainCars(train) {
  train.userData.cars.forEach((car, i) => {
    car.position.set(i === 0 ? 4.1 : -4.1, 0, 0);
    car.rotation.set(0, 0, 0);
  });
}

export function buildCar(scene) {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#8fd3c7', roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 1.8), bodyMat);
  body.position.y = 0.85;
  // open cabin (convertible!), low walls so the couple pokes out
  const front = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 1.7), bodyMat);
  front.position.set(1.35, 1.45, 0);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 1.7), bodyMat);
  back.position.set(-1.6, 1.45, 0);
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.7, 1.5),
    new THREE.MeshStandardMaterial({
      color: '#bfe8ff',
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
    })
  );
  windshield.position.set(0.85, 1.8, 0);
  windshield.rotation.z = -0.25;
  car.add(body, front, back, windshield);

  // the Uber driver, up front behind the windshield
  const driver = new THREE.Group();
  const driverBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.35, 3, 8),
    new THREE.MeshStandardMaterial({ color: '#4a4f5a', roughness: 0.8 })
  );
  driverBody.position.y = 1.25;
  const driverHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 8),
    new THREE.MeshStandardMaterial({ color: '#e8b98f', roughness: 0.8 })
  );
  driverHead.position.y = 1.78;
  const driverCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.45),
    new THREE.MeshStandardMaterial({ color: '#2e3440', roughness: 0.9 })
  );
  driverCap.position.y = 1.82;
  driver.add(driverBody, driverHead, driverCap);
  driver.position.x = 0.45;
  car.add(driver);

  const wheelMat = new THREE.MeshStandardMaterial({ color: '#333940', roughness: 0.9 });
  for (const [wx, wz] of [
    [1.1, 0.95],
    [1.1, -0.95],
    [-1.1, 0.95],
    [-1.1, -0.95],
  ]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.42, wz);
    car.add(wheel);
  }
  car.visible = false;
  scene.add(car);
  return car;
}
