import * as THREE from "three";

type animationCallbackType = (time: number) => void;
export const animationsCallback: animationCallbackType[] = [];

export function getAnimationsCallback() {
  return animationsCallback;
}

interface SinAnimationOptions {
  mesh: THREE.Object3D<THREE.Event>;
  time: number;
  min?: number;
  max?: number;
  duration?: number;
  property?: "position" | "rotation";
  direction?: "x" | "y" | "z";
}
export function sinAnimation({
  mesh,
  time,
  property = "position",
  min = 0.5,
  duration = 1000,
  max = 1,
  direction = "y"
}: SinAnimationOptions) {
  const sin = Math.sin(time / duration);
  const fromZeroToOne = (sin + 1) / 2;
  mesh[property][direction] = fromZeroToOne * (max - min) + min;
}

export function setBreatheAnimation(mesh: THREE.Object3D<THREE.Event>) {
  animationsCallback.push((time: number) => {
    sinAnimation({ mesh, time, min: -0.5, max: -0.55, duration: 400 });
  });
}

export function setHeartAnimation(mesh: THREE.Object3D<THREE.Event>) {
  animationsCallback.push((time: number) => {
    sinAnimation({ mesh, time, min: 0.9, duration: 500 });
    mesh.rotation.y = time / 500;
  });
}
