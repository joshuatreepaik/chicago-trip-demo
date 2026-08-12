// The tiny couple: two capsule people walking side by side.
// She's pink (with pigtails + a celebration hat on day 2), he's blue.
import * as THREE from 'three';

function makePerson(color, { pigtails = false } = {}) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const skin = new THREE.MeshStandardMaterial({ color: '#ffd9c0', roughness: 0.8 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.75, 4, 10), mat);
  body.position.y = 0.95;
  body.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 12), skin);
  head.position.y = 1.85;
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: '#4a3428', roughness: 0.9 })
  );
  hair.position.y = 1.92;
  g.add(body, head, hair);

  if (pigtails) {
    for (const s of [1, -1]) {
      const tail = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#4a3428', roughness: 0.9 })
      );
      tail.position.set(s * 0.42, 1.95, -0.05);
      g.add(tail);
    }
  }
  return g;
}

export function buildCouple(scene) {
  const group = new THREE.Group();
  group.scale.setScalar(1.35);

  const her = makePerson('#ff8fab', { pigtails: true });
  const him = makePerson('#6ea8fe');
  her.position.x = 0.65;
  him.position.x = -0.65;
  group.add(her, him);

  // celebration hat (hidden until day 2)
  const hat = new THREE.Group();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.26, 0.62, 10),
    new THREE.MeshStandardMaterial({ color: '#ffcf5c', roughness: 0.6 })
  );
  const pompom = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshStandardMaterial({ color: '#ff5c8a' })
  );
  pompom.position.y = 0.34;
  hat.add(cone, pompom);
  hat.position.y = 2.45;
  hat.visible = false;
  her.add(hat);

  scene.add(group);

  let t = 0;
  const targetQuat = new THREE.Quaternion();
  const lookMatrix = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);

  return {
    group,
    setHat(v) {
      hat.visible = v;
    },
    face(tangent) {
      if (tangent.lengthSq() < 1e-6) return;
      // Matrix4.lookAt(eye, target, up) points +z from target toward eye,
      // so put the tangent at "eye" to face the couple along it.
      lookMatrix.lookAt(tangent.clone().setY(0).normalize(), new THREE.Vector3(), up);
      targetQuat.setFromRotationMatrix(lookMatrix);
    },
    update(dt, walking) {
      t += dt;
      group.quaternion.slerp(targetQuat, 1 - Math.exp(-dt * 8));
      if (walking) {
        her.position.y = Math.abs(Math.sin(t * 8)) * 0.14;
        him.position.y = Math.abs(Math.sin(t * 8 + Math.PI)) * 0.14;
        her.rotation.z = Math.sin(t * 8) * 0.06;
        him.rotation.z = Math.sin(t * 8 + Math.PI) * 0.06;
      } else {
        her.position.y = Math.sin(t * 2) * 0.03;
        him.position.y = Math.sin(t * 2 + 1.2) * 0.03;
        her.rotation.z = Math.sin(t * 1.6) * 0.02;
        him.rotation.z = Math.sin(t * 1.7 + 1) * 0.02;
      }
    },
  };
}
