import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Notification } from '@/lib/notifications/notification-system'

interface NotificationMetrics {
  latency: number
  deliveryRate: number
  reconnectCount: number
  lastPing: number
}

interface UseRealtimeNotificationsProps {
  userId: string
  enabled?: boolean
  autoConnect?: boolean
}

export function useRealtimeNotifications({
  userId,
  enabled = true,
  autoConnect = true
}: UseRealtimeNotificationsProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [metrics, setMetrics] = useState<NotificationMetrics>({
    latency: 0,
    deliveryRate: 0,
    reconnectCount: 0,
    lastPing: 0
  })
  
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const pingInterval = useRef<NodeJS.Timeout>()

  // Подключение к Socket.IO
  const connect = useCallback(() => {
    if (!enabled || !userId) return

    const socketInstance = io('/api/socketio', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected:', socketInstance.id)
      setConnected(true)
      reconnectAttempts.current = 0
      
      // Аутентификация
      socketInstance.emit('authenticate', { userId })
      
      // Запуск пинга для измерения латентности
      startPing(socketInstance)
    })

    socketInstance.on('authenticated', (data: { success: boolean; userId: string; unreadCount: number }) => {
      console.log('Socket.IO authenticated:', data)
      setUnreadCount(data.unreadCount)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason)
      setConnected(false)
      stopPing()
    })

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts')
      setMetrics(prev => ({ ...prev, reconnectCount: prev.reconnectCount + 1 }))
    })

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed')
      setConnected(false)
    })

    // Обработка уведомлений
    socketInstance.on('notification:new', (data: { notification: Notification; timestamp: string }) => {
      console.log('New notification received:', data.notification)
      setNotifications(prev => [data.notification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Показать браузерное уведомление
      if ('Notification' in window && Notification.permission === 'granted') {
        new window.Notification(data.notification.title, {
          body: data.notification.message,
          icon: '/logo.svg',
          tag: data.notification.id
        })
      }
    })

    socketInstance.on('notifications:batch', (data: { notifications: Notification[]; count: number }) => {
      console.log('Batch notifications received:', data.count)
      setNotifications(data.notifications)
      setUnreadCount(data.count)
    })

    socketInstance.on('notifications:unread_count', (data: { count: number }) => {
      setUnreadCount(data.count)
    })

    socketInstance.on('notification:read:success', (data: { notificationId: string }) => {
      setNotifications(prev => 
        prev.map(n => n.id === data.notificationId ? { ...n, status: 'read' as const } : n)
      )
    })

    socketInstance.on('notifications:all_read', (data: { count: number }) => {
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })))
      setUnreadCount(0)
    })

    // Обработка пинга
    socketInstance.on('pong', (data: { timestamp: number; latency: number }) => {
      setMetrics(prev => ({
        ...prev,
        latency: data.latency,
        lastPing: Date.now()
      }))
    })

    setSocket(socketInstance)
    return socketInstance
  }, [userId, enabled])

  // Отключение
  const disconnect = useCallback(() => {
    if (socket) {
      stopPing()
      socket.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [socket])

  // Пинг для измерения латентности
  const startPing = (socketInstance: Socket) => {
    pingInterval.current = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('ping', Date.now())
      }
    }, 30000) // Каждые 30 секунд
  }

  const stopPing = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current)
    }
  }

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback((notificationId: string) => {
    if (socket && connected) {
      socket.emit('notification:read', { notificationId })
    }
  }, [socket, connected])

  // Отметить все как прочитанные
  const markAllAsRead = useCallback(() => {
    if (socket && connected) {
      socket.emit('notifications:mark_all_read')
    }
  }, [socket, connected])

  // Запрос разрешения на уведомления
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await window.Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  // Автоподключение
  useEffect(() => {
    if (autoConnect && enabled && userId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, enabled, userId, connect, disconnect])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopPing()
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  return {
    // Состояние
    connected,
    notifications,
    unreadCount,
    metrics,
    
    // Методы
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    
    // Socket instance для продвинутого использования
    socket
  }
}

// Хук для метрик Socket.IO
export function useSocketMetrics() {
  const [metrics, setMetrics] = useState({
    totalConnections: 0,
    activeConnections: 0,
    notificationsSent: 0,
    reconnects: 0,
    averageLatency: 0,
    deliveryRate: 0
  })

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/socket/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      const sanitizedError = String(error).replace(/[\r\n]/g, ' ').substring(0, 200)
      console.error('Failed to fetch socket metrics:', sanitizedError)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000) // Каждые 10 секунд
    return () => clearInterval(interval)
  }, [fetchMetrics])

  return { metrics, fetchMetrics }
}