import * as THREE from 'three';

export function createHarbor(level) {
    const harbor = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const geo = new THREE.BoxGeometry(20, 2, 10);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1;
    harbor.add(mesh);
    return harbor;
}
