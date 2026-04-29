import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { getDb } from './src/server/db.ts';
import { setupAuthRoutes } from './src/server/auth.ts';
import { setupWalletRoutes } from './src/server/wallet.ts';
import { setupAdminRoutes } from './src/server/admin.ts';
import { setupLudoEngine } from './src/server/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || 'ludo-secret-key-123';

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Initialize DB
  await getDb();

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      (socket as any).user = decoded;
      next();
    });
  });

  // API Routes
  app.use('/api/auth', setupAuthRoutes());
  app.use('/api/wallet', setupWalletRoutes());
  app.use('/api/admin', setupAdminRoutes());

  // Ludo Engine & Real-time Lobby
  setupLudoEngine(io);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
