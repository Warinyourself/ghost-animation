import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { buildAxios, buildGrid } from "./position";
import { animationsCallback, setBreatheAnimation } from "./animations";
import { generateParticles, particlesAnimate } from "./particles";
import { buildLight } from "./light";
import { vertex, fragment } from "./shader";
import { initPostprocessing, updateRender } from "./postprocessing";
import { buildOrbitControls } from "./controls";
import { createMesh, CreateMeshOptions } from "./mesh";
import { createSkyBox } from "./skybox";
import { blueLight } from "./colors";

const file = "Ghost.gltf";
let mouseX = 0;
let mouseY = 0;
const ghostGroup = new THREE.Group();
let leftEyeMesh: Mesh, rightEyeMesh: Mesh;
let heartMesh: Mesh;
const ghostNames = ["Body", "eyeLeft", "eyeRight"];
const isDeveloperMode = process.env.NODE_ENV === "development";
const isDebugMode = isDeveloperMode;
const showControls = isDeveloperMode;
const showHelpers = false;
const showParticles = true;
const heartName = "Heart";
ghostGroup.userData.clickable = true;

const uniforms = {
  uResolution: { value: { x: window.innerWidth, y: window.innerHeight } },
  uTime: { value: 0.0 }
};

const createHeart = ({
  position,
  size,
  material
}: Omit<CreateMeshOptions, "mesh">) => {
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
    console.log({ found, name: found[0]?.object.name });

    if (isClickable || isGhost) {
      console.log(`found draggable ${found}`);
    }
  }
}

document.addEventListener("click", onClick, false);

const ShaderMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: vertex,
  fragmentShader: fragment
});

function animation(time: number) {
  time += 0.01;
  uniforms.uTime.value += 0.005;

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

const blurMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0.5,
  transmission: 1
});
const colors = [
  new THREE.Color("#3FC1C9"),
  new THREE.Color("#FC5185"),
  new THREE.Color("#A267AC"),
  new THREE.Color("#3282B8")
];

const buildNimbus = () => {
  const buildMetalMaterial = (color?: THREE.Color) =>
    new THREE.MeshStandardMaterial({
      color: color || new THREE.Color(blueLight),
      roughness: 0.2,
      metalness: 1
    });

  const hearts: Array<Omit<CreateMeshOptions, "mesh">> = [
    {
      position: [2.8, 0.05, 1.3],
      size: 0.32,
      material: ShaderMaterial
    },
    {
      position: [-2.3, 1.15, -2.76],
      size: 0.72,
      material: buildMetalMaterial()
    },
    {
      position: [1.4, 0.05, 0.25],
      size: 0.18,
      material: blurMaterial
    }
  ];

  if (heartMesh) {
    const heartMeshed = hearts.map(createHeart);
    scene.add(...heartMeshed);
  }
};

export function init(canvas?: HTMLCanvasElement) {
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.01,
    30
  );

  camera.position.x = 5.12;
  camera.position.y = 1.12;
  camera.lookAt(-10, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  if (isDebugMode && showHelpers) {
    buildGrid(scene);
    buildAxios(scene);
  }

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.autoClear = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setAnimationLoop(animation);

  scene.add(createSkyBox());

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

  loader.load(file, gltf => {
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

    const geometry = new THREE.TorusGeometry(0.6, 0.04, 24, 100);
    const material = new THREE.MeshBasicMaterial({ color: blueLight });
    const torus = new THREE.Mesh(geometry, material);
    torus.name = "torus";

    const light = new THREE.PointLight(blueLight, 0.1, 100);
    light.add(torus);
    light.rotation.x = Math.PI / 2;
    light.position.y = 2.07;

    scene.add(light);

    ghostMeshes.push(light);

    ghostGroup.add(...ghostMeshes);
    setBreatheAnimation({ mesh: ghostGroup });
    scene.add(ghostGroup);
    buildNimbus();
  });

  if (!canvas) {
    document.body.appendChild(renderer.domElement);
  }
}
