/**
 * @typedef {Object} Building
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {number} level
 * @property {Object} position
 * @property {number} position.x
 * @property {number} position.y
 * @property {number} position.z
 * @property {Object} mesh
 */

/**
 * @typedef {Object} Resource
 * @property {string} type
 * @property {number} amount
 */

/**
 * @typedef {Object} UpgradeCost
 * @property {number} wood
 * @property {number} wheat
 * @property {number} gold
 * @property {number} population
 */

/**
 * @typedef {Object} GameState
 * @property {Building[]} buildings
 * @property {Object.<string, number>} resources
 * @property {Building|null} selectedBuilding
 */

module.exports = {};
