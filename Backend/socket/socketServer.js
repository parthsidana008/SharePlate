import { Server } from 'socket.io';

let io;

export const initializeSocket = (httpServer) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    'https://shareplate-swmi.vercel.app',
    'https://shareplate.vercel.app'
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || (origin && origin.includes('vercel.app'))) {
          callback(null, true);
        } else {
          callback(null, true); // Allow all for debugging
        }
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

