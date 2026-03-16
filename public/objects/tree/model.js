import * as THREE from 'three';
import config from './config.json' with { type: "json" };

// Shared Materials
const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });

export function createTree(type) {
    const group = new THREE.Group();
    group.userData.objectType = config.type;
    group.userData.objectName = config.name;
    
    // Trunk
    // Geometry optimization: reduced segments from 8 to 6
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75;
    trunk.castShadow = false;
    trunk.receiveShadow = false;
    group.add(trunk);

    if (type === 'cypress') {
        // Mediterranean Cypress: thin and tall
        // Geometry optimization: reduced segments from 8 to 6
        const leavesGeo = new THREE.ConeGeometry(0.8, 4, 6);
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 3.5;
        leaves.castShadow = false;
        leaves.receiveShadow = false;
        group.add(leaves);
    } else if (type === 'pine') {
        // Pine: wider, layered cones
        
        // Geometry optimization: reduced segments from 8 to 6
        const layer1Geo = new THREE.ConeGeometry(1.5, 2, 6);
        const layer1 = new THREE.Mesh(layer1Geo, leavesMat);
        layer1.position.y = 2.5;
        layer1.castShadow = false;
        layer1.receiveShadow = false;
        group.add(layer1);
        
        // Geometry optimization: reduced segments from 8 to 6
        const layer2Geo = new THREE.ConeGeometry(1.2, 1.8, 6);
        const layer2 = new THREE.Mesh(layer2Geo, leavesMat);
        layer2.position.y = 3.5;
        layer2.castShadow = false;
        layer2.receiveShadow = false;
        group.add(layer2);
        
        // Geometry optimization: reduced segments from 8 to 6
        const layer3Geo = new THREE.ConeGeometry(0.9, 1.5, 6);
        const layer3 = new THREE.Mesh(layer3Geo, leavesMat);
        layer3.position.y = 4.5;
        layer3.castShadow = false;
        layer3.receiveShadow = false;
        group.add(layer3);
    }

    // Geometry dispose
    group.dispose = function() {
        group.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material && child.material !== trunkMat && child.material !== leavesMat) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    };

    return group;
}
