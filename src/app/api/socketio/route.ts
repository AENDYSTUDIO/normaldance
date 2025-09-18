import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { setupSocket, getSocketMetrics } from '@/lib/socket'

// Глобальная переменная для Socket.IO сервера
let io: SocketIOServer | undefined

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.IO server on /api/socketio')
    
    // Получаем HTTP сервер из Next.js
    const httpServer: NetServer = (req as any).socket?.server
    
    if (!httpServer) {
      return new Response('HTTP server not available', { status: 500 })
    }

    // Создаем Socket.IO сервер
    io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://normaldance.vercel.app', 'https://normaldance.com']
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true
    })

    // Настройка Socket.IO
    setupSocket(io)
    
    console.log('Socket.IO server initialized successfully')
  }

  return new Response('Socket.IO server running', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// Endpoint для получения метрик
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (body.action === 'metrics') {
      const metrics = getSocketMetrics()
      return Response.json(metrics)
    }
    
    if (body.action === 'broadcast' && body.message) {
      // Отправка broadcast сообщения (только для админов)
      if (!io) {
        return new Response('Socket.IO not initialized', { status: 500 })
      }
      
      io.emit('system:broadcast', {
        message: body.message,
        timestamp: new Date().toISOString(),
        priority: body.priority || 'low'
      })
      
      return Response.json({ success: true, message: 'Broadcast sent' })
    }
    
    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Socket.IO API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}