import { Object3D } from "three";

export function logPositionMesh(object: Object3D): void {
  console.log({
    position: object.position,
    rotation: object.rotation
  });
}

export function getRegularPolygonPoints(
  center: [number, number],
  amount: number,
  radius: number
): number[][] {
  const points = [];
  const [x, y] = center;
  const alpha = (2 * Math.PI) / amount;
  for (let i = 0; i < amount; i++) {
    points.push([
      x + radius * Math.cos(alpha * i),
      y + radius * Math.sin(alpha * i)
    ]);
  }
  return points;
}
