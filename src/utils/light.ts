import * as THREE from "three";
import { Scene } from "three";
import { blueLight } from "./colors";

export function buildLight(scene: Scene) {
  const light = new THREE.SpotLight(0xb1e1ff, 0.5);
  light.angle = 0.5;
  light.decay = 1;
  light.position.set(20, 5, 0);
  scene.add(light);

  const pointLight = new THREE.PointLight(216285, 3.1);
  pointLight.decay = 1;
  pointLight.position.set(-2.37, -18.15, 20.48);
  scene.add(pointLight);

  const skyColor = 0xb1e1ff; // light blue
  const groundColor = 0xb97a20; // brownish orange
  const intensity = 1;
  const baseLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(baseLight);
}
