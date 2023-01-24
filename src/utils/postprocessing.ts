import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

interface PostprocessingInterface {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
}

let composer: EffectComposer;

export function initPostprocessing({
  renderer,
  scene,
  camera
}: PostprocessingInterface): void {
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );

  bloomPass.threshold = 0;
  bloomPass.strength = 0.3;
  bloomPass.radius = 0;
  composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.renderToScreen = true;
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
}

export function updateRender(
  time: number,
  width: number,
  height: number
): void {
  composer.render(time);
  composer.setSize(width, height);
}
