import * as THREE from "three";
import { blueLight } from "./colors";

const pointLights: THREE.PointLight[] = [];
const position = 3;
const timeDuration = 500;
const particlesAmout = 3;
const directions = ["x", "y", "z"] as const;
const randomize = (min: number, max: number) =>
  Math.random() * (max - min) + min;

function buildConst() {
  const timeRange = timeDuration * randomize(0.8, 1.6);
  const positionRange = position * randomize(0.9, 1.4);
  return { timeRange, positionRange };
}

let randomTime: any[] = [];

export function generateParticles(scene: THREE.Scene) {
  const sphere = new THREE.SphereGeometry(0.03, 16, 8);
  for (let i = 0; i < particlesAmout; i++) {
    const light = new THREE.PointLight(blueLight, 0.2, 10);
    const meshLight = new THREE.Mesh(
      sphere,
      new THREE.MeshBasicMaterial({ color: blueLight })
    );
    light.add(meshLight);

    scene.add(light);
    pointLights.push(light);
  }

  randomTime = pointLights.map(_ => {
    return {
      x: buildConst(),
      y: buildConst(),
      z: buildConst()
    };
  });
}

export function animatePointLight(
  pointLight: any,
  time: number,
  index: number
) {
  directions.forEach(direction => {
    const { timeRange, positionRange } = randomTime[index][direction];

    pointLight.position[direction] = Math.sin(time / timeRange) * positionRange;
  });
}

export function particlesAnimate(time: number) {
  pointLights.forEach((point, index) => {
    animatePointLight(point, time, index);
  });
}
