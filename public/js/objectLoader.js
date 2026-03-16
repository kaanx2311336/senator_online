import * as THREE from 'three';
import { createColosseum } from '../objects/colosseum/model.js';
import colosseumConfig from '../objects/colosseum/config.json';
import { createWall } from '../objects/wall/model.js';
import wallConfig from '../objects/wall/config.json';
import { createTower } from '../objects/tower/model.js';
import towerConfig from '../objects/tower/config.json';
import { createTree } from '../objects/tree/model.js';
import treeConfig from '../objects/tree/config.json';
import { createRoad } from '../objects/road/model.js';
import roadConfig from '../objects/road/config.json';
import { createHouse } from '../objects/house/model.js';
import houseConfig from '../objects/house/config.json';
import { createSenate } from '../objects/senate/model.js';
import senateConfig from '../objects/senate/config.json';
import { createHarbor } from '../objects/harbor/model.js';
import harborConfig from '../objects/harbor/config.json';
import { createShip } from '../objects/ship/model.js';
import shipConfig from '../objects/ship/config.json';

export const ObjectLoader = {
    loadAllObjects: () => {
        const objects = [];

        // Senate (center)
        const senate = createSenate(1);
        senate.userData.objectType = 'building';
        senate.userData.objectName = senateConfig.name || 'Senato';
        senate.userData.level = 1;
        if (senateConfig.position) {
            senate.position.set(senateConfig.position[0], senateConfig.position[1], senateConfig.position[2]);
        }
        objects.push(senate);

        // Colosseum
        if (colosseumConfig.levels) {
            const colosseum = createColosseum(1);
            colosseum.userData.objectType = colosseumConfig.type || 'building';
            colosseum.userData.objectName = colosseumConfig.name || 'Kolezyum';
            colosseum.userData.level = 1;
            if (colosseumConfig.position) {
                colosseum.position.set(colosseumConfig.position[0], colosseumConfig.position[1], colosseumConfig.position[2]);
            }
            objects.push(colosseum);
        }

        // Walls
        if (wallConfig.count && wallConfig.count > 0) {
            for (let i = 0; i < wallConfig.count; i++) {
                const wall = createWall(wallConfig.defaultLength || 10);
                wall.userData.objectType = wallConfig.type || 'defense';
                wall.userData.objectName = wallConfig.name || 'Surlar';
                wall.userData.level = 1;
                const angle = (i / wallConfig.count) * Math.PI * 2;
                const radius = 50;
                wall.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                wall.rotation.y = -angle + Math.PI / 2;
                objects.push(wall);
            }
        }

        // Towers
        if (towerConfig.count && towerConfig.count > 0) {
            for (let i = 0; i < towerConfig.count; i++) {
                const tower = createTower(towerConfig.level || 1);
                tower.userData.objectType = towerConfig.type || 'defense';
                tower.userData.objectName = towerConfig.name || 'Kule';
                tower.userData.level = 1;
                const angle = (i / towerConfig.count) * Math.PI * 2;
                const radius = 55;
                tower.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                objects.push(tower);
            }
        }

        // Houses
        const houseCount = 10;
        for (let i = 0; i < houseCount; i++) {
            const house = createHouse(1);
            house.userData.objectType = houseConfig.type || 'residential';
            house.userData.objectName = houseConfig.name || 'Ev';
            house.userData.level = 1;
            const x = (i % 5) * 12 - 24;
            const z = Math.floor(i / 5) * 12 + 15;
            house.position.set(x, 0, z);
            objects.push(house);
        }

        // Trees
        if (treeConfig.count && treeConfig.count > 0) {
            const variants = treeConfig.variants || ['cypress'];
            for (let i = 0; i < treeConfig.count; i++) {
                const type = variants[i % variants.length];
                const tree = createTree(type);
                tree.userData.objectType = treeConfig.type || 'decoration';
                tree.userData.objectName = (treeConfig.name || 'Ağaç') + ' (' + type + ')';
                const rx = (Math.random() - 0.5) * 80;
                const rz = (Math.random() - 0.5) * 80;
                tree.position.set(rx, 0, rz);
                objects.push(tree);
            }
        }

        // Roads
        if (roadConfig.paths && roadConfig.paths.length > 0) {
            for (const path of roadConfig.paths) {
                const road = createRoad(path.startX, path.startZ, path.endX, path.endZ, path.width);
                road.userData.objectType = roadConfig.type || 'decoration';
                road.userData.objectName = roadConfig.name || 'Yol';
                objects.push(road);
            }
        }

        // Harbor
        const harbor = createHarbor(1);
        harbor.userData.objectType = harborConfig.type || 'building';
        harbor.userData.objectName = harborConfig.name || 'Liman';
        harbor.userData.level = 1;
        if (harborConfig.position) {
            harbor.position.set(harborConfig.position[0], harborConfig.position[1], harborConfig.position[2]);
        }
        objects.push(harbor);

        // Ship
        const ship = createShip(1);
        ship.userData.objectType = shipConfig.type || 'vehicle';
        ship.userData.objectName = shipConfig.name || 'Gemi';
        ship.userData.level = 1;
        if (shipConfig.position) {
            ship.position.set(shipConfig.position[0], shipConfig.position[1], shipConfig.position[2]);
        }
        objects.push(ship);

        return objects;
    }
};
