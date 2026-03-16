const OkeyEngine = require('../services/OkeyEngine');
const { GAME_EVENTS, GAME_RESPONSES } = require('../shared/contracts/socketEvents');

const turnTimers = {};
const TURN_DURATION = 30000;

function startTurnTimer(io, roomId, playerId) {
  if (turnTimers[roomId]) {
    clearTimeout(turnTimers[roomId]);
  }
  
  turnTimers[roomId] = setTimeout(() => {
    try {
      // Süre dolunca otomatik taş atma
      const discardResult = OkeyEngine.autoDiscardTile(roomId, playerId);
      if (discardResult) {
        io.to(roomId).emit(GAME_RESPONSES.DISCARD_TILE || 'discard_tile', {
          playerId,
          tile: discardResult.tile
        });
        
        io.to(roomId).emit(GAME_RESPONSES.TURN_CHANGED || 'turn_changed', {
          currentTurn: discardResult.nextPlayerId
        });
        
        startTurnTimer(io, roomId, discardResult.nextPlayerId);
      }
    } catch (error) {
      console.error('Auto discard error:', error);
    }
  }, TURN_DURATION);
}

module.exports = function(io, socket) {
  
  socket.on(GAME_EVENTS.GAME_STARTED || 'game_started', (data) => {
    const roomId = data.roomId || data;
    try {
      const gameState = OkeyEngine.startGame(roomId);
      
      if (gameState && gameState.players) {
        // Her oyuncuya kendi taşlarını gönder (diğerlerinin taşlarını GÖNDERMEMELİ)
        // Gösterge taşını ve okey taşını herkese bildir.
        gameState.players.forEach(player => {
          io.to(player.id).emit(GAME_RESPONSES.GAME_STARTED || 'game_started', {
            tiles: player.tiles,
            indicator: gameState.indicator,
            okey: gameState.okey,
            currentTurn: gameState.currentTurn
          });
        });
        
        // Sıra yönetimini başlat
        startTurnTimer(io, roomId, gameState.currentTurn);
      }
    } catch (error) {
      console.error('Game start error:', error);
    }
  });

  socket.on(GAME_EVENTS.DRAW_TILE || 'draw_tile', (data) => {
    const { roomId, playerId, source } = data; // source: 'deck' or 'discard'
    try {
      // OkeyEngine.drawTile() ile validasyon ve çekme işlemi
      const drawResult = OkeyEngine.drawTile(roomId, playerId, source);
      
      // Çekilen taşı oyuncuya gönder
      socket.emit(GAME_RESPONSES.DRAW_TILE || 'draw_tile', {
        tile: drawResult.drawnTile
      });
      
      // Diğerlerine 'opponent_drew' emit et
      socket.to(roomId).emit(GAME_RESPONSES.OPPONENT_DREW || 'opponent_drew', {
        playerId
      });
    } catch (error) {
      console.error('Draw tile error:', error);
    }
  });

  socket.on(GAME_EVENTS.DISCARD_TILE || 'discard_tile', (data) => {
    const { roomId, playerId, tile } = data;
    try {
      // OkeyEngine.discardTile() ile validasyon ve taş atma işlemi
      const discardResult = OkeyEngine.discardTile(roomId, playerId, tile);
      
      // Atılan taşı herkese göster
      io.to(roomId).emit(GAME_RESPONSES.DISCARD_TILE || 'discard_tile', {
        playerId,
        tile
      });
      
      // Sırayı değiştir ve 'turn_changed' emit
      io.to(roomId).emit(GAME_RESPONSES.TURN_CHANGED || 'turn_changed', {
        currentTurn: discardResult.nextPlayerId
      });
      
      // Yeni sıra için zamanlayıcıyı başlat
      startTurnTimer(io, roomId, discardResult.nextPlayerId);
    } catch (error) {
      console.error('Discard tile error:', error);
    }
  });

  socket.on(GAME_EVENTS.SORT_TILES || 'sort_tiles', (data) => {
    const { roomId, playerId, sortedTiles } = data;
    try {
      // Oyuncunun istakasındaki taşları sıralaması (sunucu tarafı kaydet)
      OkeyEngine.sortTiles(roomId, playerId, sortedTiles);
    } catch (error) {
      console.error('Sort tiles error:', error);
    }
  });
};
