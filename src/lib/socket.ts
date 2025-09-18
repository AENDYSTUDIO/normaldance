import { Server } from 'socket.io'
import { notificationSystem, Notification } from './notifications/notification-system'

interface ConnectedUser {
  userId: string
  socketId: string
  connectedAt: Date
  lastActivity: Date
}

const connectedUsers = new Map<string, ConnectedUser>()
const socketToUser = new Map<string, string>()

// Metrics
const metrics = {
  totalConnections: 0,
  activeConnections: 0,
  notificationsSent: 0,
  reconnects: 0,
  averageLatency: 0,
  deliveryRate: 0
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    metrics.totalConnections++
    metrics.activeConnections++
    
    console.log(`Client connected: ${socket.id} (Total: ${metrics.activeConnections})`)
    
    // Аутентификация пользователя
    socket.on('authenticate', (data: { userId: string, token?: string }) => {
      const { userId } = data
      
      // Проверка существующего подключения
      const existingUser = connectedUsers.get(userId)
      if (existingUser) {
        metrics.reconnects++
        console.log(`User ${userId} reconnected`)
        const oldSocket = io.sockets.sockets.get(existingUser.socketId)
        if (oldSocket) oldSocket.disconnect()
      }
      
      // Регистрируем пользователя
      connectedUsers.set(userId, {
        userId,
        socketId: socket.id,
        connectedAt: new Date(),
        lastActivity: new Date()
      })
      socketToUser.set(socket.id, userId)
      
      socket.join(`user:${userId}`)
      
      // Отправляем непрочитанные уведомления
      const unreadNotifications = notificationSystem.getUnreadNotifications(userId)
      if (unreadNotifications.length > 0) {
        socket.emit('notifications:batch', {
          notifications: unreadNotifications,
          count: unreadNotifications.length
        })
      }
      
      socket.emit('authenticated', {
        success: true,
        userId,
        unreadCount: unreadNotifications.length
      })
    })
    
    // Обработка уведомлений
    socket.on('notification:read', async (data: { notificationId: string }) => {
      const userId = socketToUser.get(socket.id)
      if (!userId) return
      
      const success = await notificationSystem.markAsRead(data.notificationId, userId)
      if (success) {
        socket.emit('notification:read:success', { notificationId: data.notificationId })
        const unreadCount = notificationSystem.getUnreadNotifications(userId).length
        socket.emit('notifications:unread_count', { count: unreadCount })
      }
    })
    
    socket.on('notifications:mark_all_read', async () => {
      const userId = socketToUser.get(socket.id)
      if (!userId) return
      
      const count = await notificationSystem.markAllAsRead(userId)
      socket.emit('notifications:all_read', { count })
      socket.emit('notifications:unread_count', { count: 0 })
    })
    
    // Пинг для измерения латентности
    socket.on('ping', (timestamp: number) => {
      const latency = Date.now() - timestamp
      metrics.averageLatency = (metrics.averageLatency + latency) / 2
      socket.emit('pong', { timestamp, latency })
      
      const userId = socketToUser.get(socket.id)
      if (userId) {
        const user = connectedUsers.get(userId)
        if (user) user.lastActivity = new Date()
      }
    })
    
    socket.on('disconnect', (reason) => {
      metrics.activeConnections--
      const userId = socketToUser.get(socket.id)
      
      console.log(`Client disconnected: ${socket.id} (${reason}) - User: ${userId || 'unknown'}`)
      
      if (userId) {
        connectedUsers.delete(userId)
        socketToUser.delete(socket.id)
      }
    })
  })
  
  // Подписка на события системы уведомлений
  notificationSystem.on('notification.created', (notification: Notification) => {
    sendNotificationToUser(io, notification)
  })
}

// Отправка уведомления конкретному пользователю
export function sendNotificationToUser(io: Server, notification: Notification) {
  const user = connectedUsers.get(notification.userId)
  if (!user) return false
  
  io.to(`user:${notification.userId}`).emit('notification:new', {
    notification,
    timestamp: new Date().toISOString()
  })
  
  metrics.notificationsSent++
  return true
}

// Получение метрик
export function getSocketMetrics() {
  return {
    ...metrics,
    connectedUsers: connectedUsers.size
  }
}