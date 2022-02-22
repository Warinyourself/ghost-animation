import * as THREE from "three";
import { Scene } from "three";

export function buildGrid(scene: Scene) {
  const size = 10;
  const divisions = 100;
  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);
}

export function buildAxios(scene: Scene) {
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}