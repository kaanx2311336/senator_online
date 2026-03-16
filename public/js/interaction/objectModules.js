// Explicit module map for Vite compatibility (no variable dynamic imports)
const interactModules = {
  colosseum: () => import('../../objects/colosseum/interact.js'),
  wall: () => import('../../objects/wall/interact.js'),
  tower: () => import('../../objects/tower/interact.js'),
  tree: () => import('../../objects/tree/interact.js'),
  road: () => import('../../objects/road/interact.js'),
  house: () => import('../../objects/house/interact.js'),
  senate: () => import('../../objects/senate/interact.js')
};

const configModules = {
  colosseum: () => import('../../objects/colosseum/config.json'),
  wall: () => import('../../objects/wall/config.json'),
  tower: () => import('../../objects/tower/config.json'),
  tree: () => import('../../objects/tree/config.json'),
  road: () => import('../../objects/road/config.json'),
  house: () => import('../../objects/house/config.json'),
  senate: () => import('../../objects/senate/config.json')
};

export async function loadInteract(dir) {
  if (interactModules[dir]) return await interactModules[dir]();
  return null;
}

export async function loadConfig(dir) {
  if (configModules[dir]) {
    const mod = await configModules[dir]();
    return mod.default;
  }
  return null;
}
