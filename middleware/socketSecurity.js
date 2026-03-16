const rateLimitMap = new Map(); // socket.id -> { countSec, countMin, lastSec, lastMin }

const MAX_PER_SEC = 10;
const MAX_PER_MIN = 100;

function rateLimitMiddleware(socket, next) {
  // socket.use() middleware is invoked for each incoming packet.
  const now = Date.now();
  const secWindow = Math.floor(now / 1000);
  const minWindow = Math.floor(now / 60000);

  let limitData = rateLimitMap.get(socket.id);
  if (!limitData) {
    limitData = { countSec: 0, countMin: 0, lastSec: secWindow, lastMin: minWindow };
    rateLimitMap.set(socket.id, limitData);
  }

  // Reset counters if window advanced
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

  if (limitData.countSec > MAX_PER_SEC || limitData.countMin > MAX_PER_MIN) {
    return next(new Error('Rate limit exceeded.'));
  }

  next();
}

function removeRateLimit(socketId) {
  // Not used anymore as state is stored on socket object
}

function validateInput(packet, next) {
  // packet is an array: [eventName, data, ... ]
  const eventName = packet[0];
  const data = packet[1];

  if (data !== undefined && data !== null) {
    if (typeof data !== 'object' && typeof data !== 'string' && typeof data !== 'number') {
        return next(new Error('Invalid input format.'));
    }

    // String length limits
    if (typeof data === 'string' && data.length > 1000) {
      return next(new Error('Input string too long.'));
    }

    // Object limits
    if (typeof data === 'object' && !Array.isArray(data)) {
        // basic size check
        const jsonStr = JSON.stringify(data);
        if (jsonStr.length > 10000) {
            return next(new Error('Input object too large.'));
        }
        
        // Sanitize string properties inside object recursively up to a depth
        function sanitizeObject(obj, depth = 0) {
           if (depth > 5) return; // limit depth
           if (typeof obj !== 'object' || obj === null) return;
           for (const key in obj) {
             if (typeof obj[key] === 'string' && obj[key].length > 1000) {
                obj[key] = obj[key].substring(0, 1000);
             } else if (typeof obj[key] === 'object') {
                sanitizeObject(obj[key], depth + 1);
             }
           }
        }
        sanitizeObject(data);
    }
  }

  next();
}

module.exports = {
  rateLimitMiddleware,
  removeRateLimit,
  validateInput
};
