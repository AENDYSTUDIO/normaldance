'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Bell, 
  BellOff, 
  Settings, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Info,
  Star,
  Heart,
  MessageCircle,
  Users,
  Gift,
  Trophy,
  Shield,
  X,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { useNotifications } from '@/lib/notifications/notification-system'
import { NotificationType, NotificationPriority } from '@/lib/notifications/notification-system'

interface NotificationItemProps {
  notification: any
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE:
        return <Heart className="h-4 w-4 text-red-500" />
      case NotificationType.COMMENT:
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case NotificationType.FOLLOW:
        return <Users className="h-4 w-4 text-green-500" />
      case NotificationType.PLAYLIST_ADD:
        return <Star className="h-4 w-4 text-yellow-500" />
      case NotificationType.REWARD:
        return <Gift className="h-4 w-4 text-purple-500" />
      case NotificationType.ACHIEVEMENT:
        return <Trophy className="h-4 w-4 text-orange-500" />
      case NotificationType.SYSTEM:
        return <Info className="h-4 w-4 text-gray-500" />
      case NotificationType.SECURITY:
        return <Shield className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'border-red-500 bg-red-50'
      case NotificationPriority.HIGH:
        return 'border-orange-500 bg-orange-50'
      case NotificationPriority.MEDIUM:
        return 'border-blue-500 bg-blue-50'
      case NotificationPriority.LOW:
        return 'border-gray-500 bg-gray-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const isRead = notification.status === 'read'

  return (
    <Card 
      className={`transition-all duration-200 ${getPriorityColor(notification.priority)} ${
        !isRead ? 'shadow-md border-l-4' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-medium ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${!isRead ? 'text-gray-600' : 'text-gray-500'}`}>
                  {notification.message}
                </p>
                
                {notification.metadata?.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={notification.metadata.imageUrl} 
                      alt="Notification image"
                      className="w-16 h-16 rounded object-cover"
                    />
                  </div>
                )}
                
                {notification.metadata?.actionUrl && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(notification.metadata.actionUrl, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Подробнее
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                
                <div className="flex gap-1">
                  {!isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    settings,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings
  } = useNotifications('current-user-id') // В реальном приложении ID пользователя из контекста

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Фильтрация уведомлений
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') {
      return notification.status !== 'read'
    }
    if (activeTab === 'read') {
      return notification.status === 'read'
    }
    return true
  })

  // Группировка по типам
  const notificationsByType = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = []
    }
    acc[notification.type].push(notification)
    return acc
  }, {} as Record<NotificationType, any[]>)

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id)
  }

  const handleToggleNotifications = async (type: NotificationType, channel: 'email' | 'push' | 'inApp') => {
    if (!settings) return

    const newPreferences = {
      ...settings.preferences,
      [type]: {
        ...settings.preferences[type],
        [channel]: !settings.preferences[type]?.[channel]
      }
    }

    await updateSettings({
      preferences: newPreferences
    })
  }

  const handleToggleGlobalSetting = async (channel: 'email' | 'push' | 'inApp') => {
    if (!settings) return

    await updateSettings({
      [channel]: !settings[channel]
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Кнопка уведомлений */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-8 w-8 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Панель уведомлений */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Уведомления</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Отметить все прочитанными
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  Все ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Непрочитанные ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  Настройки
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-96">
                  {filteredNotifications.length > 0 ? (
                    <div className="space-y-2">
                      {filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onDelete={handleDeleteNotification}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">Нет уведомлений</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="unread" className="mt-4">
                <ScrollArea className="h-96">
                  {notifications.filter(n => n.status !== 'read').length > 0 ? (
                    <div className="space-y-2">
                      {notifications
                        .filter(n => n.status !== 'read')
                        .map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onDelete={handleDeleteNotification}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">Все уведомления прочитаны</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  {/* Глобальные настройки */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Глобальные настройки</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <span className="text-sm">Push-уведомления</span>
                        </div>
                        <Button
                          variant={settings?.push ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleGlobalSetting('push')}
                        >
                          {settings?.push ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">Email-уведомления</span>
                        </div>
                        <Button
                          variant={settings?.email ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleGlobalSetting('email')}
                        >
                          {settings?.email ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          <span className="text-sm">Внутренние уведомления</span>
                        </div>
                        <Button
                          variant={settings?.inApp ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleGlobalSetting('inApp')}
                        >
                          {settings?.inApp ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Настройки по типам */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Настройки по типам</h4>
                    <div className="space-y-2">
                      {Object.entries(settings?.preferences || {}).map(([type, prefs]) => (
                        <div key={type} className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center gap-2">
                            {getIcon(type as NotificationType)}
                            <span className="text-sm capitalize">
                              {type === 'like' ? 'Лайки' : 
                               type === 'comment' ? 'Комментарии' :
                               type === 'follow' ? 'Подписки' :
                               type === 'reward' ? 'Награды' :
                               type === 'achievement' ? 'Достижения' : type}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant={prefs?.push ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleNotifications(type as NotificationType, 'push')}
                            >
                              {prefs?.push ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant={prefs?.email ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleNotifications(type as NotificationType, 'email')}
                            >
                              {prefs?.email ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.LIKE:
      return <Heart className="h-4 w-4 text-red-500" />
    case NotificationType.COMMENT:
      return <MessageCircle className="h-4 w-4 text-blue-500" />
    case NotificationType.FOLLOW:
      return <Users className="h-4 w-4 text-green-500" />
    case NotificationType.PLAYLIST_ADD:
      return <Star className="h-4 w-4 text-yellow-500" />
    case NotificationType.REWARD:
      return <Gift className="h-4 w-4 text-purple-500" />
    case NotificationType.ACHIEVEMENT:
      return <Trophy className="h-4 w-4 text-orange-500" />
    case NotificationType.SYSTEM:
      return <Info className="h-4 w-4 text-gray-500" />
    case NotificationType.SECURITY:
      return <Shield className="h-4 w-4 text-red-600" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

export default NotificationPanel