import * as THREE from 'three';

const MATERIALS = {
  wood: new THREE.MeshLambertMaterial({ color: 0x8B5A2B }),
  lightWood: new THREE.MeshLambertMaterial({ color: 0xD2B48C }),
  stone: new THREE.MeshLambertMaterial({ color: 0x808080 }),
  field: new THREE.MeshLambertMaterial({ color: 0xCDB54A }),
  dirt: new THREE.MeshLambertMaterial({ color: 0x654321 }),
  water: new THREE.MeshLambertMaterial({ color: 0x1E90FF }),
  white: new THREE.MeshLambertMaterial({ color: 0xFAF0E6 }),
  redRoof: new THREE.MeshLambertMaterial({ color: 0xB7410E }),
  fence: new THREE.MeshLambertMaterial({ color: 0x5C4033 })
};

function createField(x, z) {
  const group = new THREE.Group();
  const fieldGeo = new THREE.PlaneGeometry(8, 8);
  const fieldMesh = new THREE.Mesh(fieldGeo, MATERIALS.field);
  fieldMesh.rotation.x = -Math.PI / 2;
  fieldMesh.position.set(x, 0.05, z);
  fieldMesh.castShadow = false;
  fieldMesh.receiveShadow = false;
  group.add(fieldMesh);

  // Dirt patches for detail
  for (let i = 0; i < 3; i++) {
    const dirtGeo = new THREE.PlaneGeometry(1.5, 3);
    const dirtMesh = new THREE.Mesh(dirtGeo, MATERIALS.dirt);
    dirtMesh.rotation.x = -Math.PI / 2;
    dirtMesh.position.set(x - 2 + Math.random() * 4, 0.06, z - 2 + Math.random() * 4);
    dirtMesh.castShadow = false;
    dirtMesh.receiveShadow = false;
    group.add(dirtMesh);
  }
  return group;
}

export function createFarm(level = 1) {
  const group = new THREE.Group();
  
  // Level 1: Küçük ahşap kulübe (BoxGeo 3x2x3, kahverengi) + tarla (PlaneGeo 8x8, sarı-yeşil 0xCDB54A)
  if (level === 1) {
    const hutGeo = new THREE.BoxGeometry(3, 2, 3);
    const hut = new THREE.Mesh(hutGeo, MATERIALS.wood);
    hut.position.set(-4, 1, 0);
    hut.castShadow = false;
    hut.receiveShadow = false;
    group.add(hut);

    group.add(createField(2, 0));
  }
  
  // Level 2: Daha büyük kulübe + çit (ince BoxGeo'lar) + 2 tarla.
  if (level === 2) {
    const hutGeo = new THREE.BoxGeometry(4, 2.5, 4);
    const hut = new THREE.Mesh(hutGeo, MATERIALS.wood);
    hut.position.set(-4, 1.25, 0);
    hut.castShadow = false;
    hut.receiveShadow = false;
    group.add(hut);
    
    // Roof
    const roofGeo = new THREE.ConeGeometry(3.5, 1.5, 4);
    const roof = new THREE.Mesh(roofGeo, MATERIALS.redRoof);
    roof.position.set(-4, 3.25, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = false;
    roof.receiveShadow = false;
    group.add(roof);

    group.add(createField(2, 2));
    group.add(createField(2, -4));

    // Fence
    for (let i = 0; i < 4; i++) {
      const fencePostGeo = new THREE.BoxGeometry(0.2, 1, 0.2);
      const post = new THREE.Mesh(fencePostGeo, MATERIALS.fence);
      post.position.set(-7 + i * 2, 0.5, 3);
      post.castShadow = false;
      post.receiveShadow = false;
      group.add(post);
    }
    const crossBarGeo = new THREE.BoxGeometry(6, 0.2, 0.1);
    const crossBar = new THREE.Mesh(crossBarGeo, MATERIALS.fence);
    crossBar.position.set(-4, 0.7, 3);
    crossBar.castShadow = false;
    crossBar.receiveShadow = false;
    group.add(crossBar);
  }

  // Level 3: Taş ev + ahır (BoxGeo) + 3 tarla + su kuyusu (CylinderGeo).
  if (level === 3) {
    const houseGeo = new THREE.BoxGeometry(4, 3, 4);
    const house = new THREE.Mesh(houseGeo, MATERIALS.stone);
    house.position.set(-5, 1.5, -2);
    house.castShadow = false;
    house.receiveShadow = false;
    group.add(house);

    const roofGeo = new THREE.ConeGeometry(3.5, 2, 4);
    const roof = new THREE.Mesh(roofGeo, MATERIALS.redRoof);
    roof.position.set(-5, 4, -2);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = false;
    roof.receiveShadow = false;
    group.add(roof);

    const barnGeo = new THREE.BoxGeometry(5, 2.5, 3);
    const barn = new THREE.Mesh(barnGeo, MATERIALS.wood);
    barn.position.set(-5, 1.25, 3);
    barn.castShadow = false;
    barn.receiveShadow = false;
    group.add(barn);

    group.add(createField(3, 3));
    group.add(createField(3, -3));
    group.add(createField(9, 0));

    // Well
    const wellGeo = new THREE.CylinderGeometry(0.8, 0.8, 1, 16, 1, true);
    const well = new THREE.Mesh(wellGeo, MATERIALS.stone);
    well.position.set(-1, 0.5, 0);
    well.castShadow = false;
    well.receiveShadow = false;
    group.add(well);

    const waterGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16);
    const water = new THREE.Mesh(waterGeo, MATERIALS.water);
    water.position.set(-1, 0.4, 0);
    water.castShadow = false;
    water.receiveShadow = false;
    group.add(water);
  }

  // Level 4: Çiftlik kompleksi + değirmen (CylinderGeo + kanatlar).
  if (level === 4) {
    const houseGeo = new THREE.BoxGeometry(5, 3.5, 5);
    const house = new THREE.Mesh(houseGeo, MATERIALS.stone);
    house.position.set(-6, 1.75, -3);
    house.castShadow = false;
    house.receiveShadow = false;
    group.add(house);
    
    const roofGeo = new THREE.ConeGeometry(4, 2.5, 4);
    const roof = new THREE.Mesh(roofGeo, MATERIALS.redRoof);
    roof.position.set(-6, 4.75, -3);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = false;
    roof.receiveShadow = false;
    group.add(roof);

    const barnGeo = new THREE.BoxGeometry(6, 3, 4);
    const barn = new THREE.Mesh(barnGeo, MATERIALS.wood);
    barn.position.set(-6, 1.5, 3);
    barn.castShadow = false;
    barn.receiveShadow = false;
    group.add(barn);

    // Mill
    const millGeo = new THREE.CylinderGeometry(1.5, 2, 5, 16);
    const mill = new THREE.Mesh(millGeo, MATERIALS.stone);
    mill.position.set(-1, 2.5, -4);
    mill.castShadow = false;
    mill.receiveShadow = false;
    group.add(mill);

    const millRoofGeo = new THREE.ConeGeometry(1.8, 1.5, 16);
    const millRoof = new THREE.Mesh(millRoofGeo, MATERIALS.redRoof);
    millRoof.position.set(-1, 5.75, -4);
    millRoof.castShadow = false;
    millRoof.receiveShadow = false;
    group.add(millRoof);

    // Blades
    const blades = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.2, 3, 0.5);
      const blade = new THREE.Mesh(bladeGeo, MATERIALS.lightWood);
      blade.position.set(0, 1.5, 0);
      const pivot = new THREE.Group();
      pivot.rotation.x = (Math.PI / 2) * i;
      pivot.add(blade);
      blades.add(pivot);
    }
    blades.position.set(-1, 4, -2.5);
    group.add(blades);
    
    // Add animation data
    group.userData = {
      animate: (dt) => {
        blades.rotation.z += dt * 0.5;
      }
    };

    group.add(createField(3, 4));
    group.add(createField(3, -2));
    group.add(createField(9, 4));
    group.add(createField(9, -2));
  }

  // Level 5: Büyük villa + 4 tarla + değirmen + hayvan ağılı.
  if (level === 5) {
    const villaBaseGeo = new THREE.BoxGeometry(6, 4, 6);
    const villaBase = new THREE.Mesh(villaBaseGeo, MATERIALS.white);
    villaBase.position.set(-6, 2, -3);
    villaBase.castShadow = false;
    villaBase.receiveShadow = false;
    group.add(villaBase);
    
    const villaRoofGeo = new THREE.ConeGeometry(5, 3, 4);
    const villaRoof = new THREE.Mesh(villaRoofGeo, MATERIALS.redRoof);
    villaRoof.position.set(-6, 5.5, -3);
    villaRoof.rotation.y = Math.PI / 4;
    villaRoof.castShadow = false;
    villaRoof.receiveShadow = false;
    group.add(villaRoof);

    const barnGeo = new THREE.BoxGeometry(7, 3.5, 5);
    const barn = new THREE.Mesh(barnGeo, MATERIALS.wood);
    barn.position.set(-6, 1.75, 4);
    barn.castShadow = false;
    barn.receiveShadow = false;
    group.add(barn);
    
    // Animal pen
    const penGeo = new THREE.BoxGeometry(4, 0.5, 4);
    const pen = new THREE.Mesh(penGeo, MATERIALS.dirt);
    pen.position.set(-1, 0.25, 4);
    pen.castShadow = false;
    pen.receiveShadow = false;
    group.add(pen);

    // Fence around pen
    const fenceHGeo = new THREE.BoxGeometry(4, 0.8, 0.1);
    const fence1 = new THREE.Mesh(fenceHGeo, MATERIALS.fence);
    fence1.position.set(-1, 0.4, 6);
    fence1.castShadow = false;
    fence1.receiveShadow = false;
    group.add(fence1);
    const fence2 = new THREE.Mesh(fenceHGeo, MATERIALS.fence);
    fence2.position.set(-1, 0.4, 2);
    fence2.castShadow = false;
    fence2.receiveShadow = false;
    group.add(fence2);
    
    const fenceVGeo = new THREE.BoxGeometry(0.1, 0.8, 4);
    const fence3 = new THREE.Mesh(fenceVGeo, MATERIALS.fence);
    fence3.position.set(1, 0.4, 4);
    fence3.castShadow = false;
    fence3.receiveShadow = false;
    group.add(fence3);
    const fence4 = new THREE.Mesh(fenceVGeo, MATERIALS.fence);
    fence4.position.set(-3, 0.4, 4);
    fence4.castShadow = false;
    fence4.receiveShadow = false;
    group.add(fence4);

    // Mill
    const millGeo = new THREE.CylinderGeometry(1.8, 2.5, 6, 16);
    const mill = new THREE.Mesh(millGeo, MATERIALS.stone);
    mill.position.set(-1, 3, -4);
    mill.castShadow = false;
    mill.receiveShadow = false;
    group.add(mill);

    const millRoofGeo = new THREE.ConeGeometry(2.1, 1.8, 16);
    const millRoof = new THREE.Mesh(millRoofGeo, MATERIALS.redRoof);
    millRoof.position.set(-1, 6.9, -4);
    millRoof.castShadow = false;
    millRoof.receiveShadow = false;
    group.add(millRoof);

    const blades = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.2, 3.5, 0.6);
      const blade = new THREE.Mesh(bladeGeo, MATERIALS.lightWood);
      blade.position.set(0, 1.75, 0);
      const pivot = new THREE.Group();
      pivot.rotation.x = (Math.PI / 2) * i;
      pivot.add(blade);
      blades.add(pivot);
    }
    blades.position.set(-1, 4.5, -2.1);
    group.add(blades);
    
    group.userData = {
      animate: (dt) => {
        blades.rotation.z += dt * 0.7;
      }
    };

    group.add(createField(4, 5));
    group.add(createField(4, -3));
    group.add(createField(10, 5));
    group.add(createField(10, -3));
  }

  return group;
}
