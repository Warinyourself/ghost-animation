import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Camera, WebGLRenderer } from "three";

let controls: any;

export function buildOrbitControls(camera: Camera, renderer: WebGLRenderer) {
  controls = new OrbitControls(camera, renderer.domElement);

  controls.screenSpacePanning = false;
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.update();

  controls.maxPolarAngle = Math.PI / 2.1;
}
