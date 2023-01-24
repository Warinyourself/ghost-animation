import * as THREE from "three";

const skyboxImage = "purplenebula";
let skyboxGeo, skybox;
const size = 30;

function createPathStrings(filename: string) {
  const basePath = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/${filename}/`;
  const baseFilename = basePath + filename;
  const fileType = ".png";
  const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
  const pathStings = sides.map(side => {
    return baseFilename + "_" + side + fileType;
  });

  return pathStings;
}

function createMaterialArray(filename: string) {
  const skyboxImagepaths = createPathStrings(filename);
  const materialArray = skyboxImagepaths.map(image => {
    const texture = new THREE.TextureLoader().load(image);

    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

export function createSkyBox() {
  const materialArray = createMaterialArray(skyboxImage);
  skyboxGeo = new THREE.BoxGeometry(size, size, size);
  return new THREE.Mesh(skyboxGeo, materialArray);
}
