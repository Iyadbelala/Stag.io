import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`
  ☕ Stag.io Server is running!
  📡 http://localhost:${PORT}
  🔧 Environment: ${process.env.NODE_ENV || 'development'}
  🔌 Socket.io ready
  `);
});
