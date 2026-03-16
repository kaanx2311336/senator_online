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

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/auth', authRoutes);

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_okey_online';

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as necessary
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

  // Register socket handlers
  lobbySocket(io, socket);
  gameSocket(io, socket);
  chatSocket(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
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
