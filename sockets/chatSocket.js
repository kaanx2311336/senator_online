const { CHAT_EVENTS } = require('../shared/contracts/socketEvents');

module.exports = function(io, socket) {
  // Oda içi mesajlaşma (room_chat)
  socket.on('room_chat', (data) => {
    const { roomId, message } = data;
    if (!roomId || !message) return;

    // CHAT_EVENTS kullanarak odaya mesaj yayınla
    io.to(`room_${roomId}`).emit(CHAT_EVENTS.RECEIVE_MESSAGE, {
      sender: {
        id: socket.user.id,
        username: socket.user.username
      },
      message: message,
      timestamp: new Date().toISOString()
    });
  });

  // Hazır mesajlar (quick_message)
  socket.on('quick_message', (data) => {
    const { roomId, messageType } = data;
    if (!roomId || !messageType) return;

    const quickMessages = {
      'good_game': 'İyi oyunlar',
      'get_well': 'Geçmiş olsun',
      'hello': 'Merhaba',
      'good_luck': 'Bol şans',
      'thanks': 'Teşekkürler'
    };

    const message = quickMessages[messageType];
    if (message) {
      io.to(`room_${roomId}`).emit(CHAT_EVENTS.RECEIVE_MESSAGE, {
        sender: {
          id: socket.user.id,
          username: socket.user.username
        },
        message: message,
        isQuickMessage: true,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Genel mesajlaşma desteği (SEND_MESSAGE) - shared/contracts/socketEvents.js uyarınca
  socket.on(CHAT_EVENTS.SEND_MESSAGE, (data) => {
    const { roomId, message } = data;
    if (!roomId || !message) return;

    io.to(`room_${roomId}`).emit(CHAT_EVENTS.RECEIVE_MESSAGE, {
      sender: {
        id: socket.user.id,
        username: socket.user.username
      },
      message: message,
      timestamp: new Date().toISOString()
    });
  });
};
