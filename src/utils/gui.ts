import { GUI } from "dat.gui";

const gui = new GUI();

interface GUIOptions {
  camera: THREE.Camera;
  meshes?: THREE.Mesh[];
}

export function buildGUI({ camera, meshes }: GUIOptions): void {
  const cameraFolder = gui.addFolder("Camera");
  const cameraRotationFolder = cameraFolder.addFolder("Rotation");
  cameraRotationFolder.add(camera.rotation, "x", 0, Math.PI * 2, 0.01);
  cameraRotationFolder.add(camera.rotation, "y", 0, Math.PI * 2, 0.01);
  cameraRotationFolder.add(camera.rotation, "z", 0, Math.PI * 2, 0.01);

  const cameraPositionFolder = cameraFolder.addFolder("Position");
  cameraPositionFolder.add(camera.position, "x", -5, 5, 0.01);
  cameraPositionFolder.add(camera.position, "y", -5, 5, 0.01);
  cameraPositionFolder.add(camera.position, "z", -5, 5, 0.01);

  if (meshes) {
    meshes.forEach((mesh, index) => {
      const meshFolder = gui.addFolder(mesh.name || `Mesh_${index + 1}`);
      const property = { size: 1 };
      meshFolder.open();

      const positionFolder = meshFolder.addFolder("Position");
      positionFolder.add(mesh.position, "x", -5, 5, 0.01);
      positionFolder.add(mesh.position, "y", -5, 5, 0.01);
      positionFolder.add(mesh.position, "z", -5, 5, 0.01);
      positionFolder.open();

      const rotationFolder = meshFolder.addFolder("Rotation");
      rotationFolder.add(mesh.rotation, "x", 0, Math.PI * 2, 0.01);
      rotationFolder.add(mesh.rotation, "y", 0, Math.PI * 2, 0.01);
      rotationFolder.add(mesh.rotation, "z", 0, Math.PI * 2, 0.01);
      rotationFolder.open();

      const scaleFolder = meshFolder.addFolder("Scale");
      scaleFolder.add(property, "size", 0, 2, 0.01).onChange(value => {
        if (typeof value === "number") {
          mesh.scale.set(value, value, value);
        }
      });

      scaleFolder.open();
    });
  }
}
