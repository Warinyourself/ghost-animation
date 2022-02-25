import { GUI } from "dat.gui";

const gui = new GUI();

export function buildGUI(camera: THREE.Camera) {
  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.open();
  const cameraRotationFolder = cameraFolder.addFolder("Rotation");
  cameraRotationFolder.add(camera.rotation, "x", 0, Math.PI * 2, 0.01);
  cameraRotationFolder.add(camera.rotation, "y", 0, Math.PI * 2, 0.01);
  cameraRotationFolder.add(camera.rotation, "z", 0, Math.PI * 2, 0.01);
  cameraRotationFolder.open();

  const cameraPositionFolder = cameraFolder.addFolder("Position");
  cameraPositionFolder.add(camera.position, "x", -5, 5, 0.01);
  cameraPositionFolder.add(camera.position, "y", -5, 5, 0.01);
  cameraPositionFolder.add(camera.position, "z", -5, 5, 0.01);
  cameraPositionFolder.open();
}
