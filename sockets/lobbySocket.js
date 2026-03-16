const roomManager = require('../roomManager');

module.exports = function(io, socket) {
  // Try to load shared constants if they exist
  let LOBBY_EVENTS, ROOM_EVENTS;
  try {
    const events = require('../shared/contracts/socketEvents.js');
    LOBBY_EVENTS = events.LOBBY_EVENTS || {};
    ROOM_EVENTS = events.ROOM_EVENTS || {};
  } catch (e) {
    // Fallback if file not found or inaccessible
    LOBBY_EVENTS = {
      CREATE_ROOM: 'create_room',
      ROOM_CREATED: 'room_created',
      JOIN_ROOM: 'join_room',
      PLAYER_JOINED: 'player_joined',
      LEAVE_ROOM: 'leave_room',
      PLAYER_LEFT: 'player_left',
      ROOM_LIST: 'room_list',
      PLAYER_READY: 'player_ready',
      GAME_STARTING: 'game_starting'
    };
    ROOM_EVENTS = {
      ROOM_UPDATED: 'room_updated'
    };
  }

  // Ensure fallback constants if missing from shared file
  LOBBY_EVENTS.CREATE_ROOM = LOBBY_EVENTS.CREATE_ROOM || 'create_room';
  LOBBY_EVENTS.ROOM_CREATED = LOBBY_EVENTS.ROOM_CREATED || 'room_created';
  LOBBY_EVENTS.JOIN_ROOM = LOBBY_EVENTS.JOIN_ROOM || 'join_room';
  LOBBY_EVENTS.PLAYER_JOINED = LOBBY_EVENTS.PLAYER_JOINED || 'player_joined';
  LOBBY_EVENTS.LEAVE_ROOM = LOBBY_EVENTS.LEAVE_ROOM || 'leave_room';
  LOBBY_EVENTS.PLAYER_LEFT = LOBBY_EVENTS.PLAYER_LEFT || 'player_left';
  LOBBY_EVENTS.ROOM_LIST = LOBBY_EVENTS.ROOM_LIST || 'room_list';
  LOBBY_EVENTS.PLAYER_READY = LOBBY_EVENTS.PLAYER_READY || 'player_ready';
  LOBBY_EVENTS.GAME_STARTING = LOBBY_EVENTS.GAME_STARTING || 'game_starting';
  ROOM_EVENTS.ROOM_UPDATED = ROOM_EVENTS.ROOM_UPDATED || 'room_updated';

  socket.on(LOBBY_EVENTS.CREATE_ROOM, (data) => {
    try {
      const roomName = data ? data.roomName : null;
      const owner = {
        id: socket.user ? socket.user.id : socket.id,
        username: socket.user ? socket.user.username : 'Guest',
        ready: false,
        socketId: socket.id
      };
      
      const newRoom = roomManager.createRoom(roomName, owner);
      socket.join(newRoom.id);
      
      socket.emit(LOBBY_EVENTS.ROOM_CREATED, newRoom);
      io.emit(LOBBY_EVENTS.ROOM_LIST, roomManager.listRooms());
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on(LOBBY_EVENTS.JOIN_ROOM, (data) => {
    try {
      const roomId = data.roomId;
      const player = {
        id: socket.user ? socket.user.id : socket.id,
        username: socket.user ? socket.user.username : 'Guest',
        ready: false,
        socketId: socket.id
      };

      const room = roomManager.joinRoom(roomId, player);
      socket.join(roomId);

      // Broadcast to others in room
      socket.to(roomId).emit(LOBBY_EVENTS.PLAYER_JOINED, {
        roomId: room.id,
        player: player
      });
      
      // Update everyone with new room list
      io.emit(LOBBY_EVENTS.ROOM_LIST, roomManager.listRooms());
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on(LOBBY_EVENTS.LEAVE_ROOM, (data) => {
    try {
      const roomId = data.roomId;
      const userId = socket.user ? socket.user.id : socket.id;
      const result = roomManager.leaveRoom(roomId, userId);
      
      socket.leave(roomId);

      if (!result.roomDeleted) {
        socket.to(roomId).emit(LOBBY_EVENTS.PLAYER_LEFT, {
          roomId: roomId,
          playerId: userId
        });
      }

      // Update room list
      io.emit(LOBBY_EVENTS.ROOM_LIST, roomManager.listRooms());
    } catch (error) {
       socket.emit('error', { message: error.message });
    }
  });

  socket.on(LOBBY_EVENTS.ROOM_LIST, () => {
    const rooms = roomManager.listRooms();
    socket.emit(LOBBY_EVENTS.ROOM_LIST, rooms);
  });

  socket.on(LOBBY_EVENTS.PLAYER_READY, (data) => {
    try {
      const roomId = data.roomId;
      const userId = socket.user ? socket.user.id : socket.id;
      const result = roomManager.setPlayerReady(roomId, userId);
      
      io.to(roomId).emit(ROOM_EVENTS.ROOM_UPDATED, result.room);

      if (result.allReady) {
        io.to(roomId).emit(LOBBY_EVENTS.GAME_STARTING, { roomId: roomId });
      }
    } catch (error) {
       socket.emit('error', { message: error.message });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = socket.user ? socket.user.id : socket.id;
    const rooms = roomManager.rooms;
    for (let [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === userId);
      if (playerIndex !== -1) {
        try {
          const result = roomManager.leaveRoom(roomId, userId);
          if (!result.roomDeleted) {
            socket.to(roomId).emit(LOBBY_EVENTS.PLAYER_LEFT, {
              roomId: roomId,
              playerId: userId
            });
          }
          io.emit(LOBBY_EVENTS.ROOM_LIST, roomManager.listRooms());
        } catch(e) {}
        break;
      }
    }
  });
};
