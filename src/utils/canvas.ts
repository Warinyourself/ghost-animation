import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Camera, Scene, Mesh } from "three";
import { buildAxios, buildGrid } from "./position";
import {
  animationsCallback,
  setBreatheAnimation,
  setHeartAnimation
} from "./animations";

let controls: any;
let camera: Camera, scene: Scene, renderer: any;
const isDebugMode = true;
const showHelpers = true;

const ghostName = "Sphere001";
const heartName = "Heart001";

function animation(time: number) {
  time += 0.01;

  // console.log({ animationsCallback });
  animationsCallback.forEach(callback => callback(time));

  renderer.render(scene, camera);
}

export function init(canvas?: HTMLCanvasElement) {
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.01,
    30
  );
  // todo: set right camera position
  camera.position.x = 3;
  camera.position.y = 1;

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
  controls.update();

  controls.maxPolarAngle = Math.PI / 2.1;

  const skyColor = 0xb1e1ff; // light blue
  const groundColor = 0xb97a20; // brownish orange
  const intensity = 1;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);

  const loader = new GLTFLoader().setPath("/");

  loader.load("Ghost.gltf", gltf => {
    scene.add(gltf.scene);

    gltf.scene.traverse(object => {
      const mesh = object as Mesh;
      console.log({ mesh });

      if (mesh.name === ghostName) {
        mesh.geometry.center();
        setBreatheAnimation(mesh);
      } else if (mesh.name === heartName) {
        const heartSize = 0.15;
        setHeartAnimation(mesh);
        mesh.material = new THREE.MeshNormalMaterial();
        mesh.scale.set(heartSize, heartSize, heartSize);
      }
    });
  });

  if (!canvas) {
    document.body.appendChild(renderer.domElement);
  }
}
