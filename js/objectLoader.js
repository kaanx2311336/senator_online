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

        // Trees
        if (treeConfig.count && treeConfig.count > 0) {
            for (let i = 0; i < treeConfig.count; i++) {
                // Alternating types
                const type = treeConfig.variants[i % treeConfig.variants.length];
                const tree = createTree(type);
                tree.userData.objectType = treeConfig.type;
                tree.userData.objectName = treeConfig.name;
                // Random position within a certain area
                const randomX = (Math.random() - 0.5) * 40;
                const randomZ = (Math.random() - 0.5) * 40;
                tree.position.set(randomX, 0, randomZ);
                objects.push(tree);
            }
        }

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
