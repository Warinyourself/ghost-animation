import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { buildAxios, buildGrid } from "./position";
import {
  animationsCallback,
  setBreatheAnimation,
  setRotationAnimation
} from "./animations";
import { generateParticles, particlesAnimate } from "./particles";
import { buildLight } from "./light";
import { buildPositionFolder } from "./gui";
import { initPostprocessing, updateRender } from "./postprocessing";
import { getRegularPolygonPoints } from "./helpers";
import { buildOrbitControls } from "./controls";

let mouseX = 0;
let mouseY = 0;
const ghostGroup = new THREE.Group();
let leftEyeMesh: Mesh, rightEyeMesh: Mesh;
let heartMesh: Mesh;
const ghostNames = ["Body", "eyeLeft", "eyeRight"];
ghostGroup.userData.clickable = true;

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
  console.log({ found });

  if (found.length > 0) {
    const lastObject = found.pop()?.object;
    const isClickable = lastObject && lastObject.userData.clickable;
    const isGhost = lastObject && lastObject.name === "Body_1";

    if (isClickable || isGhost) {
      console.log(`found draggable ${found}`);
    }
  }
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

  buildPositionFolder(camera, "camera");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x999999);

  if (isDebugMode && showHelpers) {
    buildGrid(scene);
    buildAxios(scene);
  }

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.autoClear = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);

  if (showControls) {
    buildOrbitControls(camera, renderer);
  }

  if (showParticles) {
    generateParticles(scene);
  }

  buildLight(scene);
  initPostprocessing({ renderer, scene, camera });

  const loader = new GLTFLoader().setPath("/");
  const ghostMeshes: Mesh[] = [];

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

    function createHeart(
      position: [number, number, number],
      size: number,
      material: THREE.Material
    ) {
      const [x, y, z] = position;

      const heart = new THREE.Mesh(heartMesh.geometry, material);
      heart.scale.set(size, size, size);
      heart.position.set(y, x, z);
      return heart;
    }

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
  });

  if (!canvas) {
    document.body.appendChild(renderer.domElement);
  }
}
