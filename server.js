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

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as necessary
    methods: ['GET', 'POST']
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
