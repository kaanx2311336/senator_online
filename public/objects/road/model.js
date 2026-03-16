import * as THREE from 'three';
import config from './config.json' with { type: "json" };

const material = new THREE.MeshLambertMaterial({ color: 0xC4B59B }); // grey-beige color

export function createRoad(startX, startZ, endX, endZ, width) {
    const dx = endX - startX;
    const dz = endZ - startZ;
    const length = Math.sqrt(dx * dx + dz * dz);
    
    // Create road geometry
    const geometry = new THREE.PlaneGeometry(width, length);
    
    const road = new THREE.Mesh(geometry, material);
    
    // Position exactly in the middle of start and end
    const midX = startX + dx / 2;
    const midZ = startZ + dz / 2;
    road.position.set(midX, 0.05, midZ); // slightly raised
    
    // Rotate to face from start to end
    // Plane is initially flat on XY if we don't rotate it, but ThreeJS planes 
    // are often X-Y. Oh wait, PlaneGeometry is created on X-Y plane by default.
    // So we need to rotate it to lay flat on X-Z.
    road.rotation.x = -Math.PI / 2;
    
    // Calculate angle. Math.atan2(dz, dx) gives the angle.
    // However, since it's already rotated on X, we rotate around Z. Wait no, after x rotation,
    // the axis are rotated. Let's use a group to make it simpler, or just rotate Z.
    // It's easier to create a group and rotate the group.
    
    const group = new THREE.Group();
    group.userData.objectType = config.type;
    group.userData.objectName = config.name;
    
    // Let's create the road so it starts at 0,0, goes along Z axis
    const localGeo = new THREE.PlaneGeometry(width, length);
    const localRoad = new THREE.Mesh(localGeo, material);
    
    localRoad.rotation.x = -Math.PI / 2;
    
    // Set shadows
    localRoad.castShadow = false;
    localRoad.receiveShadow = false;
    
    group.add(localRoad);
    
    // Position group at midpoint
    group.position.set(midX, 0.05, midZ);
    
    // Rotate group around Y axis
    const angle = Math.atan2(dx, dz);
    group.rotation.y = angle;

    group.dispose = function() {
        group.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material && child.material !== material) {
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
