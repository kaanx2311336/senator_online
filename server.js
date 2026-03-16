require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const lobbySocket = require('./sockets/lobbySocket');
const gameSocket = require('./sockets/gameSocket');
const chatSocket = require('./sockets/chatSocket');
const sqlm = require('./sqlm');

const app = express();
const server = http.createServer(app);

const roomManager = require('./roomManager');
const OkeyEngine = require('./services/OkeyEngine');

// Setup CORS and JSON parsing
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100kb' }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/auth', authRoutes);

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_okey_online';

// Socket.IO configuration
const { rateLimitMiddleware, removeRateLimit, validateInput } = require('./middleware/socketSecurity');
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*', // Adjust as necessary
    methods: ['GET', 'POST']
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Use middleware for rate limiting and input validation
  socket.use((packet, next) => {
    // packet format is usually [ eventName, ...args ]
    validateInput(packet, (err) => {
      if (err) return next(err);
      
      const now = Date.now();
      const secWindow = Math.floor(now / 1000);
      const minWindow = Math.floor(now / 60000);
      
      let limitData = socket.rateLimitData;
      if (!limitData) {
        limitData = { countSec: 0, countMin: 0, lastSec: secWindow, lastMin: minWindow };
        socket.rateLimitData = limitData;
      }
      
      // Reset counters
      if (limitData.lastSec !== secWindow) {
        limitData.lastSec = secWindow;
        limitData.countSec = 0;
      }
      if (limitData.lastMin !== minWindow) {
        limitData.lastMin = minWindow;
        limitData.countMin = 0;
      }
      
      limitData.countSec++;
      limitData.countMin++;
      
      if (limitData.countSec > 10 || limitData.countMin > 100) {
        return next(new Error('Rate limit exceeded.'));
      }
      
      next();
    });
  });

  socket.on('error', (err) => {
    socket.emit('error', { message: err.message });
  });

  // Register socket handlers
  lobbySocket(io, socket);
  gameSocket(io, socket);
  chatSocket(io, socket);

  // Check if user was in a game
  if (socket.user && socket.user.id) {
    const room = roomManager.getPlayerRoom(socket.user.id);
    if (room && room.status === 'playing') {
      try {
        const reconnectedRoom = roomManager.reconnectPlayer(room.id, socket.user, socket.id);
        socket.join(reconnectedRoom.id);
        socket.emit('reconnect_success', { roomId: reconnectedRoom.id });
        
        // Notify others
        socket.to(reconnectedRoom.id).emit('player_reconnected', { playerId: socket.user.id });
        
        // Restore game state
        const gameState = OkeyEngine.gameState[reconnectedRoom.id];
        if (gameState) {
           const playerState = gameState.players.find(p => p.id === socket.user.id);
           if (playerState) {
              socket.emit('game_state_restore', {
                 tiles: playerState.tiles,
                 indicator: gameState.indicator,
                 okey: gameState.okey,
                 currentTurn: gameState.currentTurn
              });
           }
        }
      } catch (err) {
        // Only fails if time elapsed > 60s
        console.error('Reconnect failed:', err.message);
      }
    }
  }

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    removeRateLimit(socket.id);
  });
});

const PORT = process.env.PORT || 3000;

sqlm.initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
