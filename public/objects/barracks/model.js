import * as THREE from 'three';

export function createBarracks(level) {
    const group = new THREE.Group();
    
    // Simple barracks model
    const geometry = new THREE.BoxGeometry(3, 2, 3);
    const material = new THREE.MeshLambertMaterial({ color: 0x8b0000 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.position.y = 1;
    group.add(mesh);

    group.userData = {
        objectType: 'building',
        objectName: 'Barracks',
        level: level
    };

    return group;
}
