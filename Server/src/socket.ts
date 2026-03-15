import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from './protocol/middleware/auth.middleware';

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, ''),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      // Join user-specific room
      socket.join(payload.sub);
    } catch {
      socket.disconnect();
    }
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
