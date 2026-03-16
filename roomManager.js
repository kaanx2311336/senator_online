class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.roomIdCounter = 1;
  }

  createRoom(roomName, owner) {
    const roomId = `room_${this.roomIdCounter++}`;
    const newRoom = {
      id: roomId,
      name: roomName || `Oda ${roomId}`,
      owner: owner,
      players: [owner], // Array of player objects { id, username, ready }
      maxPlayers: 4,
      status: 'waiting', // waiting, playing, finished
      createdAt: Date.now()
    };
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  joinRoom(roomId, player) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Oda bulunamadı');
    }
    if (room.status !== 'waiting') {
      throw new Error('Oda bekleme durumunda değil');
    }
    if (room.players.length >= room.maxPlayers) {
      throw new Error('Oda dolu');
    }
    
    // Check if player already in room
    const exists = room.players.find(p => p.id === player.id);
    if (exists) {
      throw new Error('Oyuncu zaten odada');
    }

    room.players.push(player);
    return room;
  }

  leaveRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Oda bulunamadı');
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Oyuncu odada değil');
    }

    // If game is playing, handle disconnect/reconnect logic
    if (room.status === 'playing') {
      const player = room.players[playerIndex];
      player.disconnectedAt = Date.now();
      player.isConnected = false;
      return { roomDeleted: false, room, removedPlayer: player, isDisconnect: true };
    }

    const removedPlayer = room.players.splice(playerIndex, 1)[0];

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return { roomDeleted: true, room: null, removedPlayer };
    }

    // If owner left, reassign owner
    if (room.owner.id === playerId) {
      room.owner = room.players[0];
    }

    return { roomDeleted: false, room, removedPlayer };
  }

  reconnectPlayer(roomId, player, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Oda bulunamadı');
    }

    const existingPlayer = room.players.find(p => p.id === player.id);
    if (!existingPlayer) {
      throw new Error('Oyuncu odada değil');
    }

    if (existingPlayer.disconnectedAt) {
      const timeDisconnected = Date.now() - existingPlayer.disconnectedAt;
      if (timeDisconnected > 60000) { // 60 seconds
        throw new Error('Yeniden bağlanma süresi doldu');
      }
      existingPlayer.disconnectedAt = null;
      existingPlayer.isConnected = true;
      existingPlayer.socketId = socketId;
      return room;
    }

    throw new Error('Oyuncu zaten bağlı');
  }

  getPlayerRoom(playerId) {
    for (const [roomId, room] of this.rooms.entries()) {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        return room;
      }
    }
    return null;
  }

  setPlayerReady(roomId, playerId) {
     const room = this.rooms.get(roomId);
     if (!room) {
        throw new Error('Oda bulunamadı');
     }
     const player = room.players.find(p => p.id === playerId);
     if (!player) {
        throw new Error('Oyuncu odada değil');
     }
     
     player.ready = true;
     
     // Check if all players are ready and room is full
     const allReady = room.players.length === room.maxPlayers && room.players.every(p => p.ready);
     
     if (allReady) {
       room.status = 'playing';
     }

     return { room, allReady };
  }

  listRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      owner: room.owner.username,
      playersCount: room.players.length,
      maxPlayers: room.maxPlayers,
      status: room.status
    }));
  }
}

module.exports = new RoomManager();
