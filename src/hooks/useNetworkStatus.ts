import { useState, useEffect } from 'react';

// Определяем типы для информации о сети, чтобы избежать ошибок TypeScript
interface CustomNavigator extends Navigator {
  connection?: {
    effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    addEventListener: (type: string, listener: EventListener) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
  };
}

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [effectiveType, setEffectiveType] = useState('4g');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionStatus = () => {
      const connection = (navigator as CustomNavigator).connection;
      if (connection && connection.effectiveType) {
        setEffectiveType(connection.effectiveType);
      }
    };

    // Устанавливаем начальные значения
    updateOnlineStatus();
    updateConnectionStatus();

    // Добавляем слушатели событий
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    const connection = (navigator as CustomNavigator).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionStatus);
    }

    // Очистка при размонтировании компонента
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);

  return { isOnline, effectiveType };
};

export default useNetworkStatus;
