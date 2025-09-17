# Vercel-optimized server.ts for NORMALDANCE

import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

// Vercel doesn't support custom servers in production
if (process.env.VERCEL) {
  // For Vercel, we'll use Pusher for WebSocket instead of Socket.IO
  console.log('🚀 Running on Vercel - using Pusher for WebSocket');
  
  // Export Next.js app for Vercel
  const nextApp = next({ 
    dev: false, 
    dir: process.cwd(),
    conf: { distDir: './.next' }
  });
  
  await nextApp.prepare();
  export default nextApp.getRequestHandler();
} else {
  // Custom server for local development and other platforms
  async function createCustomServer() {
    try {
      const nextApp = next({ 
        dev,
        dir: process.cwd(),
        conf: dev ? undefined : { distDir: './.next' }
      });

      await nextApp.prepare();
      const handle = nextApp.getRequestHandler();

      const server = createServer((req, res) => {
        if (req.url?.startsWith('/api/socketio')) {
          return;
        }
        handle(req, res);
      });

      const io = new Server(server, {
        path: '/api/socketio',
        cors: {
          origin: process.env.NEXTAUTH_URL || '*',
          methods: ['GET', 'POST']
        }
      });

      setupSocket(io);

      server.listen(port, hostname, () => {
        console.log(`🚀 Server running on http://${hostname}:${port}`);
        console.log(`📡 Socket.IO available at http://${hostname}:${port}/api/socketio`);
      });

    } catch (error) {
      console.error('❌ Server startup error:', error);
      process.exit(1);
    }
  }

  createCustomServer();
}
