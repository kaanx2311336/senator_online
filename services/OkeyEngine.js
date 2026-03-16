/**
 * OkeyEngine - Okey oyun motoru
 * 106 taş: 4 renk (kırmızı, sarı, mavi, siyah) x 13 sayı x 2 set + 2 sahte joker
 */

const COLORS = ['red', 'yellow', 'blue', 'black'];
const games = new Map();

function createTileSet() {
  const tiles = [];
  for (let set = 0; set < 2; set++) {
    for (const color of COLORS) {
      for (let num = 1; num <= 13; num++) {
        tiles.push({ color, number: num, id: `${color}_${num}_${set}` });
      }
    }
  }
  // 2 sahte joker
  tiles.push({ color: 'joker', number: 0, id: 'joker_0' });
  tiles.push({ color: 'joker', number: 0, id: 'joker_1' });
  return tiles;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function determineOkey(indicator) {
  // Gösterge taşının bir üstü okey olur. 13'ün üstü 1'e döner.
  const okeyNumber = indicator.number === 13 ? 1 : indicator.number + 1;
  return { color: indicator.color, number: okeyNumber };
}

function isOkey(tile, okeyTile) {
  if (tile.color === 'joker') return true;
  return tile.color === okeyTile.color && tile.number === okeyTile.number;
}

function startGame(roomId) {
  const tiles = shuffle(createTileSet());
  const indicator = tiles.pop();
  const okey = determineOkey(indicator);

  const playerTiles = [];
  // İlk oyuncu 15, diğerleri 14 taş alır
  playerTiles.push(tiles.splice(0, 15));
  playerTiles.push(tiles.splice(0, 14));
  playerTiles.push(tiles.splice(0, 14));
  playerTiles.push(tiles.splice(0, 14));

  const game = {
    indicator,
    okey,
    deck: tiles,
    discardPile: [],
    players: [
      { id: null, tiles: playerTiles[0], score: 0 },
      { id: null, tiles: playerTiles[1], score: 0 },
      { id: null, tiles: playerTiles[2], score: 0 },
      { id: null, tiles: playerTiles[3], score: 0 }
    ],
    currentTurn: 0,
    handNumber: 1,
    totalScores: [0, 0, 0, 0]
  };

  games.set(roomId, game);

  return {
    indicator,
    okey,
    currentTurn: 0,
    players: game.players
  };
}

function getGame(roomId) {
  const game = games.get(roomId);
  if (!game) throw new Error('Game not found');
  return game;
}

function drawTile(roomId, playerId, source) {
  const game = getGame(roomId);
  let drawnTile;

  if (source === 'discard' && game.discardPile.length > 0) {
    drawnTile = game.discardPile.pop();
  } else {
    if (game.deck.length === 0) throw new Error('Deck is empty');
    drawnTile = game.deck.pop();
  }

  const player = game.players.find(p => p.id === playerId);
  if (player) player.tiles.push(drawnTile);

  return { drawnTile };
}

function discardTile(roomId, playerId, tile) {
  const game = getGame(roomId);
  const player = game.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');

  const tileIndex = player.tiles.findIndex(t => t.id === tile.id);
  if (tileIndex === -1) throw new Error('Tile not in hand');

  const removed = player.tiles.splice(tileIndex, 1)[0];
  game.discardPile.push(removed);

  // Sıradaki oyuncu
  const currentIndex = game.players.indexOf(player);
  const nextPlayerId = game.players[(currentIndex + 1) % 4].id;
  game.currentTurn = (currentIndex + 1) % 4;

  return { nextPlayerId };
}

function autoDiscardTile(roomId, playerId) {
  const game = getGame(roomId);
  const player = game.players.find(p => p.id === playerId);
  if (!player || player.tiles.length === 0) return null;

  // Son taşı at
  const tile = player.tiles[player.tiles.length - 1];
  return { tile, ...discardTile(roomId, playerId, tile) };
}

function sortTiles(roomId, playerId, sortedTiles) {
  const game = getGame(roomId);
  const player = game.players.find(p => p.id === playerId);
  if (player) player.tiles = sortedTiles;
}

function checkRuns(tiles, okeyTile) {
  // Per (run): Aynı renk, ardışık en az 3 sayı
  // Okey joker olarak kullanılabilir
  return tiles.length >= 3 &&
    tiles.every((t, i) => {
      if (i === 0) return true;
      const prev = tiles[i - 1];
      if (isOkey(t, okeyTile) || isOkey(prev, okeyTile)) return true;
      return t.color === prev.color && t.number === prev.number + 1;
    });
}

function checkSets(tiles, okeyTile) {
  // Çift/set: Aynı sayı, farklı renkler, en az 3 taş
  if (tiles.length < 3 || tiles.length > 4) return false;
  const nonJokers = tiles.filter(t => !isOkey(t, okeyTile));
  const numbers = [...new Set(nonJokers.map(t => t.number))];
  const colors = [...new Set(nonJokers.map(t => t.color))];
  return numbers.length <= 1 && colors.length === nonJokers.length;
}

function validateWin(roomId, playerId) {
  const game = getGame(roomId);
  const player = game.players.find(p => p.id === playerId);
  if (!player) return { valid: false, error: 'Player not found' };

  // Basit doğrulama: 14 taş olmalı (15 - 1 atılan)
  // Tüm taşlar gruplar halinde olmalı
  const tiles = [...player.tiles];
  const valid = tiles.length === 14 && canFormValidHand(tiles, game.okey);

  if (valid) {
    const scores = {};
    game.players.forEach((p, i) => {
      if (p.id === playerId) {
        scores[p.id] = 0; // Kazanan 0 puan
      } else {
        scores[p.id] = calculatePenalty(p.tiles, game.okey);
      }
    });

    const isMatchEnd = game.handNumber >= 5;

    return {
      valid: true,
      hands: game.players.map(p => ({ id: p.id, tiles: p.tiles })),
      scores,
      isMatchEnd
    };
  }

  return { valid: false, error: 'Invalid hand arrangement' };
}

function canFormValidHand(tiles, okeyTile) {
  // Basit backtracking ile grup kontrolü
  if (tiles.length === 0) return true;
  if (tiles.length < 3) return false;

  // Tüm olası 3-4'lü grupları dene
  for (let len = 3; len <= Math.min(tiles.length, 13); len++) {
    for (let i = 0; i <= tiles.length - len; i++) {
      const group = tiles.slice(i, i + len);
      const sorted = [...group].sort((a, b) => a.number - b.number);

      if (checkRuns(sorted, okeyTile) || checkSets(group, okeyTile)) {
        const remaining = [...tiles.slice(0, i), ...tiles.slice(i + len)];
        if (canFormValidHand(remaining, okeyTile)) return true;
      }
    }
  }
  return false;
}

function calculatePenalty(tiles, okeyTile) {
  let penalty = 0;
  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      penalty += tile.color === 'joker' ? 50 : 25;
    } else {
      penalty += tile.number;
    }
  }
  return penalty;
}

function startNewHand(roomId) {
  const game = getGame(roomId);
  game.handNumber++;
  const tiles = shuffle(createTileSet());
  const indicator = tiles.pop();
  const okey = determineOkey(indicator);

  game.indicator = indicator;
  game.okey = okey;
  game.deck = tiles;
  game.discardPile = [];

  game.players[0].tiles = tiles.splice(0, 15);
  game.players[1].tiles = tiles.splice(0, 14);
  game.players[2].tiles = tiles.splice(0, 14);
  game.players[3].tiles = tiles.splice(0, 14);

  game.currentTurn = 0;

  return {
    indicator,
    okey,
    currentTurn: 0,
    players: game.players
  };
}

module.exports = {
  startGame,
  drawTile,
  discardTile,
  autoDiscardTile,
  sortTiles,
  validateWin,
  startNewHand,
  getGame
};
