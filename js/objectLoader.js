import * as THREE from 'three';
import { createColosseum } from '../objects/colosseum/model.js';
import colosseumConfig from '../objects/colosseum/config.json' with { type: "json" };

import { createWall } from '../objects/wall/model.js';
import wallConfig from '../objects/wall/config.json' with { type: "json" };

import { createTower } from '../objects/tower/model.js';
import towerConfig from '../objects/tower/config.json' with { type: "json" };

import { createTree } from '../objects/tree/model.js';
import treeConfig from '../objects/tree/config.json' with { type: "json" };

import { createRoad } from '../objects/road/model.js';
import roadConfig from '../objects/road/config.json' with { type: "json" };

import { createHouse } from '../objects/house/model.js';
import houseConfig from '../objects/house/config.json' with { type: "json" };

export const ObjectLoader = {
    loadColosseum: (level) => createColosseum(level),
    loadWall: (length) => createWall(length),
    loadTower: (level) => createTower(level),
    loadTree: (type) => createTree(type),
    loadRoad: (startX, startZ, endX, endZ, width) => createRoad(startX, startZ, endX, endZ, width),
    
    loadAllObjects: () => {
        const objects = [];

        // Colosseum (single instance)
        if (colosseumConfig.level) {
            const colosseum = createColosseum(colosseumConfig.level);
            colosseum.userData.objectType = colosseumConfig.type || "building";
            colosseum.userData.objectName = colosseumConfig.name || "Kolezyum";
            // Default position if not provided, for now 0,0,0 is ok
            objects.push(colosseum);
        }

        // Walls (multiple instances based on count, spread around)
        if (wallConfig.count && wallConfig.count > 0) {
            for (let i = 0; i < wallConfig.count; i++) {
                const wallLength = wallConfig.defaultLength || 10;
                const wall = createWall(wallLength);
                wall.userData.objectType = wallConfig.type || "defense";
                wall.userData.objectName = wallConfig.name || "Surlar";
                // Place it in a circle for demo
                const angle = (i / wallConfig.count) * Math.PI * 2;
                const radius = 15;
                wall.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                wall.rotation.y = -angle + Math.PI / 2;
                objects.push(wall);
            }
        }

        // Towers
        if (towerConfig.count && towerConfig.count > 0) {
            for (let i = 0; i < towerConfig.count; i++) {
                const towerLevel = towerConfig.level || 1;
                const tower = createTower(towerLevel);
                tower.userData.objectType = towerConfig.type || "defense";
                tower.userData.objectName = towerConfig.name || "Kule";
                // Place it in a wider circle for demo
                const angle = (i / towerConfig.count) * Math.PI * 2;
                const radius = 20;
                tower.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                objects.push(tower);
            }
        }

        // Trees (InstancedMesh)
        if (treeConfig.count && treeConfig.count > 0) {
            // Create one instance of each variant to extract meshes
            const variantMeshes = {};
            treeConfig.variants.forEach(type => {
                const treeGroup = createTree(type);
                const meshes = [];
                treeGroup.updateMatrixWorld(true);
                treeGroup.traverse(child => {
                    if (child.isMesh) {
                        meshes.push({
                            geometry: child.geometry,
                            material: child.material,
                            localMatrix: child.matrixWorld.clone() // relative to group origin
                        });
                    }
                });
                variantMeshes[type] = meshes;
            });
            
            // Count per variant
            const counts = {};
            const positions = {};
            for (let i = 0; i < treeConfig.count; i++) {
                const type = treeConfig.variants[i % treeConfig.variants.length];
                counts[type] = (counts[type] || 0) + 1;
                
                if (!positions[type]) positions[type] = [];
                const randomX = (Math.random() - 0.5) * 40;
                const randomZ = (Math.random() - 0.5) * 40;
                positions[type].push(new THREE.Vector3(randomX, 0, randomZ));
            }
            
            // Create InstancedMeshes
            const dummy = new THREE.Object3D();
            Object.keys(variantMeshes).forEach(type => {
                const count = counts[type];
                if (!count) return;
                
                // For each mesh part of this tree variant (e.g. trunk, leaves)
                variantMeshes[type].forEach(part => {
                    const instancedMesh = new THREE.InstancedMesh(part.geometry, part.material, count);
                    instancedMesh.castShadow = false;
                    instancedMesh.receiveShadow = false;
                    
                    // Set userData for interaction
                    instancedMesh.userData.objectType = treeConfig.type;
                    instancedMesh.userData.objectName = treeConfig.name + " (" + type + ")";
                    instancedMesh.userData.isInstanced = true;
                    
                    // Set positions
                    for (let i = 0; i < count; i++) {
                        const pos = positions[type][i];
                        dummy.position.copy(pos);
                        dummy.rotation.set(0, 0, 0);
                        dummy.scale.set(1, 1, 1);
                        dummy.updateMatrix();
                        
                        // Apply the local matrix of the part
                        const instanceMatrix = new THREE.Matrix4().multiplyMatrices(dummy.matrix, part.localMatrix);
                        instancedMesh.setMatrixAt(i, instanceMatrix);
                    }
                    instancedMesh.instanceMatrix.needsUpdate = true;
                    objects.push(instancedMesh);
                });
            });
        }
        // Houses (InstancedMesh)
        // Assume we have 10 houses of level 1 for demo
        const houseCount = 10;
        const houseLevel = 1;
        const houseGroup = createHouse(houseLevel);
        const houseMeshes = [];
        houseGroup.updateMatrixWorld(true);
        houseGroup.traverse(child => {
            if (child.isMesh) {
                houseMeshes.push({
                    geometry: child.geometry,
                    material: child.material,
                    localMatrix: child.matrixWorld.clone()
                });
            }
        });
        
        const dummyHouse = new THREE.Object3D();
        houseMeshes.forEach(part => {
            const instancedMesh = new THREE.InstancedMesh(part.geometry, part.material, houseCount);
            instancedMesh.castShadow = false;
            instancedMesh.receiveShadow = false;
            
            instancedMesh.userData.objectType = houseConfig.type || "residential";
            instancedMesh.userData.objectName = houseConfig.name || "Ev";
            instancedMesh.userData.isInstanced = true;
            
            for (let i = 0; i < houseCount; i++) {
                // Place houses in a small grid
                const x = (i % 5) * 8 - 16;
                const z = Math.floor(i / 5) * 8 - 4;
                
                dummyHouse.position.set(x, 0, z);
                dummyHouse.rotation.set(0, 0, 0);
                dummyHouse.scale.set(1, 1, 1);
                dummyHouse.updateMatrix();
                
                const instanceMatrix = new THREE.Matrix4().multiplyMatrices(dummyHouse.matrix, part.localMatrix);
                instancedMesh.setMatrixAt(i, instanceMatrix);
            }
            instancedMesh.instanceMatrix.needsUpdate = true;
            objects.push(instancedMesh);
        });


        // Roads
        if (roadConfig.paths && roadConfig.paths.length > 0) {
            for (const path of roadConfig.paths) {
                const road = createRoad(path.startX, path.startZ, path.endX, path.endZ, path.width);
                road.userData.objectType = roadConfig.type;
                road.userData.objectName = roadConfig.name;
                objects.push(road);
            }
        }

        return objects;
    }
};
