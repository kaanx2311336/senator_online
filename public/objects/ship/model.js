import * as THREE from 'three';

export function createShip(level) {
    const ship = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const geo = new THREE.BoxGeometry(8, 2, 4);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.position.y = 1;
    ship.add(mesh);
    return ship;
}
