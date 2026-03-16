import { updateResource, flashResource } from './topBar.js';

let resources = {
    wood: 500,
    wheat: 300,
    population: 50,
    gold: 1000
};

export function addResource(type, amount) {
    if (resources[type] !== undefined) {
        resources[type] += amount;
        updateResource(type, resources[type], amount);
        return true;
    }
    return false;
}

export function spendResource(type, amount) {
    if (resources[type] !== undefined) {
        if (resources[type] >= amount) {
            resources[type] -= amount;
            updateResource(type, resources[type], -amount);
            return true;
        } else {
            flashResource(type);
        }
    }
    return false;
}

export function canAfford(cost) {
    for (const [type, amount] of Object.entries(cost)) {
        if (resources[type] === undefined || resources[type] < amount) {
            return false;
        }
    }
    return true;
}

export function getResources() {
    return { ...resources };
}
