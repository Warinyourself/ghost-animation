import * as THREE from "three";

export interface CreateMeshOptions {
  mesh: THREE.Mesh;
  position: [number, number, number];
  size: number;
  material: THREE.Material;
}

export function createMesh({
  mesh,
  position,
  size,
  material
}: CreateMeshOptions): THREE.Mesh {
  const [x, y, z] = position;

  const item = new THREE.Mesh(mesh.geometry, material);
  item.scale.set(size, size, size);
  item.position.set(x, y, z);
  return item;
}
