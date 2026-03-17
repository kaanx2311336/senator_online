// shared/contracts/objectRegistry.js

const ObjectRegistry = {
  BUILDINGS: {
    SENATE: "senate",
    COLOSSEUM: "colosseum",
    HOUSE: "house"
  },
  DEFENSE: {
    WALL: "wall",
    TOWER: "tower"
  },
  DECORATION: {
    TREE: "tree",
    ROAD: "road"
  },
  RESOURCES: {
    WOOD: "wood",
    WHEAT: "wheat",
    POPULATION: "population",
    GOLD: "gold"
  },
  COMMERCE: {
    MARKET: "market"
  },
  FAITH: {
    TEMPLE: "temple"
  },
  TRADE: {
    PORT: "port",
    SHIP: "ship"
  },
  MILITARY: {
    BARRACKS: "barracks",
    ARCHERY_RANGE: "archery_range",
    STABLE: "stable"
  },
  PRODUCTION: {
    FARM: "farm",
    LUMBERJACK: "lumberjack",
    MINE: "mine"
  }
};

module.exports = ObjectRegistry;
