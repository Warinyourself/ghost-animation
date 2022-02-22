import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Camera, Scene } from "three";
import { buildAxios, buildGrid } from "./position";
import { setBreatheAnimation } from "./animations";
let controls: any;
let camera: Camera, scene: Scene, renderer: any;
const isDebugMode = true;
const showHelpers = false;

const ghostName = "Sphere001";
const heartName = "Heart001";

function animation(time: number) {
  controls.update();

  time += 0.01;

  renderer.render(scene, camera);
}

export function init(canvas?: HTMLCanvasElement) {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    30
  );
  camera.position.z = 10;
  camera.position.y = 0;
  camera.rotateX(-1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x171717);

  if (isDebugMode && showHelpers) {
    buildGrid(scene);
    buildAxios(scene);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);

  controls = new OrbitControls(camera, renderer.domElement);

  controls.screenSpacePanning = false;
  controls.minDistance = 2;
  controls.maxDistance = 10;

  controls.maxPolarAngle = Math.PI / 2.1;

  const skyColor = 0xb1e1ff; // light blue
  const groundColor = 0xb97a20; // brownish orange
  const intensity = 1;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);

  const loader = new GLTFLoader().setPath("/");

  loader.load("Ghost.gltf", gltf => {
    scene.add(gltf.scene);
    console.log({ gltf });
    gltf.scene.traverse(mesh => {
      console.log({ mesh });
      if (mesh.name === ghostName) {
        setBreatheAnimation(mesh);
      }
    });
  });

  if (!canvas) {
    document.body.appendChild(renderer.domElement);
  }
}
