import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { buildAxios, buildGrid } from "./position";
import {
  animationsCallback,
  setBreatheAnimation,
  setRotationAnimation
} from "./animations";
import { generateParticles, particlesAnimate } from "./particles";
import { buildLight } from "./light";
import { buildGUI } from "./gui";

import { initPostprocessing, updateRender } from "./postprocessing";
import { getRegularPolygonPoints } from "./helpers";
import { buildOrbitControls } from "./controls";
import { createMesh, CreateMeshOptions } from "./mesh";

let mouseX = 0;
let mouseY = 0;
const ghostGroup = new THREE.Group();
let leftEyeMesh: Mesh, rightEyeMesh: Mesh;
let heartMesh: Mesh;
const ghostNames = ["Body", "eyeLeft", "eyeRight"];
ghostGroup.userData.clickable = true;

const createHeart = (
  position: CreateMeshOptions["position"],
  size: CreateMeshOptions["size"],
  material: CreateMeshOptions["material"]
) => {
  return createMesh({
    mesh: heartMesh,
    position,
    size,
    material
  });
};

function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

document.addEventListener("mousemove", onMouseMove, false);

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer;
const isDebugMode = true;
const showHelpers = false;
const showControls = true;
const showParticles = true;
const heartName = "Heart";
const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();

function intersect(pos: THREE.Vector2) {
  raycaster.setFromCamera(pos, camera);
  return raycaster.intersectObjects(scene.children);
}

function onClick(event: MouseEvent) {
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const found = intersect(clickMouse);

  if (found.length > 0) {
    const lastObject = found.pop()?.object;
    const isClickable = lastObject && lastObject.userData.clickable;
    const isGhost = lastObject && lastObject.name === "Body_1";

    if (isClickable || isGhost) {
      console.log(`found draggable ${found}`);
    }
  }
}

const skyboxImage = "purplenebula";
let skyboxGeo, skybox;

function createPathStrings(filename: string) {
  const basePath = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/${filename}/`;
  const baseFilename = basePath + filename;
  const fileType = ".png";
  const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
  const pathStings = sides.map(side => {
    return baseFilename + "_" + side + fileType;
  });

  return pathStings;
}

function createMaterialArray(filename: string) {
  const skyboxImagepaths = createPathStrings(filename);
  const materialArray = skyboxImagepaths.map(image => {
    const texture = new THREE.TextureLoader().load(image);

    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

document.addEventListener("click", onClick, false);

function animation(time: number) {
  time += 0.01;

  animationsCallback.forEach(callback => callback(time));

  if (showParticles) {
    particlesAnimate(time);
  }

  if (ghostGroup) {
    ghostGroup.rotation.y = mouseX * 0.35;
    ghostGroup.rotation.z = mouseY * 0.35;
  }

  if (rightEyeMesh && leftEyeMesh) {
    leftEyeMesh.rotation.y = rightEyeMesh.rotation.y = mouseX * 0.5;
    leftEyeMesh.rotation.x = rightEyeMesh.rotation.x = mouseY * -0.5;
  }
  if (camera && !showControls) {
    camera.position.z = mouseX * -0.5;
    camera.position.y = 1.57 + mouseY * 0.5;
  }

  updateRender(time, window.innerWidth, window.innerHeight);
}

const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load("../../public/normal.jpg");
normalMapTexture.wrapS = THREE.RepeatWrapping;
normalMapTexture.wrapT = THREE.RepeatWrapping;

const ghostMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0.5,
  transmission: 0.9,
  normalMap: normalMapTexture,
  clearcoatNormalMap: normalMapTexture
});

const buildNimbus = () => {
  const colors = [
    new THREE.Color("#3FC1C9"),
    new THREE.Color("#FC5185"),
    new THREE.Color("#A267AC"),
    new THREE.Color("#3282B8")
  ];

  const [x, y, z] = [0, 0, 2.05];
  const heartAmout = 12;
  const nimbusRadius = 0.65;
  const positions = getRegularPolygonPoints([x, y], heartAmout, nimbusRadius);
  const nimbusGroup = new THREE.Group();

  const defaultMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#FC5185"),
    roughness: 0.35,
    metalness: 0.55
  });

  scene.add(createHeart([0.05, 1.4, 0.25], 0.18, defaultMaterial));

  positions.forEach(position => {
    const [x, y] = position;
    const size = 0.04;
    const heart = createHeart([z, x, y], size, defaultMaterial);
    setRotationAnimation(heart, "y", 300);
    nimbusGroup.add(heart);
  });

  setRotationAnimation(nimbusGroup, "y", 3000);
  ghostGroup.add(nimbusGroup);
};

export function init(canvas?: HTMLCanvasElement) {
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.01,
    30
  );

  camera.position.y = 1;
  camera.position.x = 4.12;
  camera.rotation.y = 1.57;
  camera.lookAt(-10, 0, 0);

  buildGUI(camera);
  // buildPositionFolder(camera, "camera");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  if (isDebugMode && showHelpers) {
    buildGrid(scene);
    buildAxios(scene);
  }

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.autoClear = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);

  const materialArray = createMaterialArray(skyboxImage);
  skyboxGeo = new THREE.BoxGeometry(10, 10, 10);
  skybox = new THREE.Mesh(skyboxGeo, materialArray);

  scene.add(skybox);

  if (showControls) {
    buildOrbitControls(camera, renderer);
  }

  if (showParticles) {
    generateParticles(scene);
  }

  buildLight(scene);
  initPostprocessing({ renderer, scene, camera });

  const loader = new GLTFLoader().setPath("/");
  const ghostMeshes: Object3D[] = [];

  loader.load("Ghost.gltf", gltf => {
    gltf.scene.traverse(object => {
      const mesh = object as Mesh;
      if (mesh.name === heartName) {
        heartMesh = mesh;
      } else if (ghostNames.includes(mesh.name)) {
        if (mesh.name === "eyeLeft") {
          leftEyeMesh = mesh;
        } else if (mesh.name === "eyeRight") {
          rightEyeMesh = mesh;
        }

        ghostMeshes.push(mesh);
      }
    });

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onWindowResize);

    ghostGroup.add(...ghostMeshes);
    setBreatheAnimation(ghostGroup);
    scene.add(ghostGroup);
    buildNimbus();
  });

  if (!canvas) {
    document.body.appendChild(renderer.domElement);
  }
}
