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
import { generateParticles, particlesAnimate } from "./particles";
import { buildLight } from "./light";

let controls: any;
let camera: Camera, scene: Scene, renderer: any;
const isDebugMode = true;
const showHelpers = false;
const showParticles = false;

const heartName = "Heart";

function animation(time: number) {
  time += 0.01;

  animationsCallback.forEach(callback => callback(time));

  if (showParticles) {
    particlesAnimate(time);
  }

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
  scene.background = new THREE.Color(0x999999);

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

  if (showParticles) {
    generateParticles(scene);
  }

  buildLight(scene);

  const group = new THREE.Group();
  scene.add(group);

  const loader = new GLTFLoader().setPath("/");

  loader.load("Ghost.gltf", gltf => {
    gltf.scene.children.forEach(mesh => {
      if (mesh.name === heartName) {
        setTimeout(() => {
          scene.add(mesh);
        });
        const heartSize = 0.15;
        setHeartAnimation(mesh);
        mesh.scale.set(heartSize, heartSize, heartSize);
      } else {
        setTimeout(() => {
          group.add(mesh);
        });
      }
    });

    setBreatheAnimation(group);

    console.log({ group });
    console.log({ child: gltf.scene.children });
  });

  if (!canvas) {
    document.body.appendChild(renderer.domElement);
  }
}
