import * as THREE from "three";

type animationCallbackType = (time: number) => void;
export let animationsCallback: animationCallbackType[] = [];

export function getAnimationsCallback() {
  return animationsCallback;
}

type DirectionType = "x" | "y" | "z";

interface SinAnimationOptions {
  mesh: THREE.Object3D<THREE.Event>;
  time: number;
  min?: number;
  max?: number;
  duration?: number;
  property?: "position" | "rotation";
  direction?: DirectionType;
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

export function deleteAnimation(animation: animationCallbackType) {
  const index = animationsCallback.lastIndexOf(animation);
  animationsCallback = animationsCallback.slice(index, 1);
}

export function setRotationAnimation(
  mesh: THREE.Object3D<THREE.Event>,
  direction: DirectionType = "y",
  divider = 1000
) {
  animationsCallback.push((time: number) => {
    mesh.rotation[direction] = time / divider;
  });
}

export function setHeartAnimation(mesh: THREE.Object3D<THREE.Event>) {
  animationsCallback.push((time: number) => {
    const direction = "y";
    const position = mesh.position[direction];
    const [min, max] = [position - 0.001, position + 0.001];

    sinAnimation({
      mesh,
      time,
      min,
      max,
      duration: 500,
      direction
    });
    mesh.rotation.y = time / 500;
  });
}

interface BreatheAnimatoinOptions {
  mesh: THREE.Object3D<THREE.Event>;
  min?: number;
  max?: number;
  duration?: number;
}

export function setBreatheAnimation(options: BreatheAnimatoinOptions): void {
  const { min, max, mesh, duration } = {
    min: -0.5,
    max: -0.55,
    duration: 400,
    ...options
  };

  animationsCallback.push((time: number) => {
    sinAnimation({ mesh, time, min, max, duration });
  });
}
