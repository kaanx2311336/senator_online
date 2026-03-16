import { createColosseum } from '../objects/colosseum/model.js';
import { createWall } from '../objects/wall/model.js';
import { createTower } from '../objects/tower/model.js';

export const ObjectLoader = {
    loadColosseum: (level) => createColosseum(level),
    loadWall: (length) => createWall(length),
    loadTower: (level) => createTower(level)
};
