import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { buildAxios, buildGrid } from "./position";
import {
  animationsCallback,
  setBreatheAnimation,
  setHeartAnimation
} from "./animations";
import { generateParticles, particlesAnimate } from "./particles";
import { buildLight } from "./light";
import { buildPositionFolder } from "./gui";
import { initPostprocessing, updateRender } from "./postprocessing";

let mouseX = 0;
let mouseY = 0;
const groupGhost = new THREE.Group();
let leftEyeMesh: Mesh, rightEyeMesh: Mesh;
let heartMesh: Mesh;
const ghostNames = ["Body", "eyeLeft", "eyeRight"];
groupGhost.userData.clickable = true;

function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

document.addEventListener("mousemove", onMouseMove, false);

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer;
const isDebugMode = true;
const showHelpers = false;
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

  if (groupGhost) {
    groupGhost.rotation.y = mouseX * 0.35;
    groupGhost.rotation.z = mouseY * 0.35;
  }

  if (rightEyeMesh && leftEyeMesh) {
    leftEyeMesh.rotation.y = rightEyeMesh.rotation.y = mouseX * 0.5;
    leftEyeMesh.rotation.x = rightEyeMesh.rotation.x = mouseY * -0.5;
  }
  if (camera) {
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
      } else {
        console.log({ name: mesh.name, type: mesh.type });
      }
    });

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onWindowResize);

    groupGhost.add(...ghostMeshes);
    setBreatheAnimation(groupGhost);
    scene.add(groupGhost);

    const coords = [
      {
        x: 1.4,
        y: 0.25,
        z: 0.5,
        material: new THREE.MeshStandardMaterial({
          color: new THREE.Color("#3FC1C9"),
          roughness: 0.35,
          metalness: 0.15
        })
      },
      {
        x: -0.51,
        size: 0.4,
        y: 2.86,
        z: -3.43,
        color: new THREE.Color("#FC5185")
      },
      {
        x: 2.63,
        y: 0.05,
        z: -1.75,
        size: 0.3,
        color: new THREE.Color("#A267AC")
      },
      {
        x: 0.5,
        y: 1.5,
        size: 0.3,
        z: 5,
        color: new THREE.Color("#3282B8")
      }
    ];

    for (let i = 0; i < 4; i++) {
      const coord = coords[i];
      const defaultMaterial = new THREE.MeshStandardMaterial({
        color: coord.color,
        roughness: 0.35,
        metalness: 0.55
      });
      const { x, y, z, material, size } = {
        size: 0.15,
        material: defaultMaterial,
        ...coord
      };
      const heart = new THREE.Mesh(heartMesh.geometry, material);
      heart.scale.set(size, size, size);
      heart.position.set(x, y, z);
      scene.add(heart);
    }
  });

  if (!canvas) {
    document.body.appendChild(renderer.domElement);
  }
}
