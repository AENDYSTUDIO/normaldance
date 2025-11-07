import React, { useState, useCallback } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { InvisibleWalletAdapterImpl } from '@/components/wallet/invisible-wallet-adapter';
import { musicTokenUtils } from '@/lib/wallet/music-token-manager';
import { logger } from '@/lib/utils/logger';
import { AppError, ExternalServiceError } from '@/lib/errors/AppError';

interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  price: number;
  durationMinutes: number;
  ndtRequired?: number;
}

interface MusicAccessButtonProps {
  wallet: InvisibleWalletAdapterImpl;
  track: TrackInfo;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  showBalance?: boolean;
}

export const MusicAccessButton: React.FC<MusicAccessButtonProps> = ({
  wallet,
  track,
  onSuccess,
  onError,
  className = '',
  disabled = false,
  showBalance = true
}) => {
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Проверка баланса и доступа
  const checkAccessStatus = useCallback(async () => {
    if (!wallet.connected) {
      return;
    }

    try {
      // Проверка баланса NDT токенов
      const ndtBalance = await wallet.getBalance?.() || 0;
      setBalance(ndtBalance);

      // Проверка доступа к треку
      const accessData = {
        trackId: track.id,
        artistId: track.artist,
        accessPrice: track.ndtRequired || 0,
        accessDuration: track.durationMinutes * 60,
        maxAccesses: 1
      };

      const canAccess = await wallet.checkTrackAccess(track.id, accessData);
      setHasAccess(canAccess);
    } catch (error) {
      logger.error("Error checking access status", error as Error);
      setHasAccess(false);
    }
    setLoading(false);
  }, [wallet, track]);

  // Обработчик покупки доступа
  const handlePurchaseAccess = useCallback(async () => {
    if (!wallet.connected || loading) {
      return;
    }

    setLoading(true);
    
    try {
      // Проверка доступности трека
      await checkAccessStatus();
      
      if (hasAccess) {
        throw new Error("You already have access to this track");
      }

      // Расчет цены доступа
      const requiredTokens = track.ndtRequired || 
        wallet.calculateAccessPrice(track.price, track.durationMinutes);

      // Если достаточно NDT токенов, покупаем напрямую
      if (balance && balance >= requiredTokens) {
        const transaction = await wallet.purchaseTrackAccess?.(
          track.id,
          {
            trackId: track.id,
            artistId: track.artist,
            accessPrice: requiredTokens,
            accessDuration: track.durationMinutes * 60,
            maxAccesses: 1
          }
        );
        
        if (transaction) {
          const signature = await wallet.sendTransaction(transaction, wallet.connection);
          onSuccess?.(signature);
        }
      } else {
        // Недостаточно токенов, покупаем за Stars
        const result = await wallet.purchaseTrackWithStars(track.id, track.price);
        const signature = await wallet.sendTransaction(result.transaction, wallet.connection);
        onSuccess?.(signature);
      }
      
      // Обновление статуса доступа
      await checkAccessStatus();
    } catch (error) {
      logger.error("Error purchasing track access", error as Error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [wallet, track, loading, hasAccess, balance, checkAccessStatus, onSuccess, onError]);

  // Проверка статуса при монтировании
  React.useEffect(() => {
    if (wallet.connected) {
      checkAccessStatus();
    }
  }, [wallet.connected, checkAccessStatus]);

  // Подписка на события кошелька
  React.useEffect(() => {
    if (!wallet.connected) return;

    const handleTransactionComplete = () => {
      checkAccessStatus();
    };

    const handleBalanceUpdate = () => {
      checkAccessStatus();
    };

    // Подписка на события (метода on нет в интерфейсе, поэтому комментируем)
    // wallet.on('transaction_sent', handleTransactionComplete);
    // wallet.on('balance_updated', handleBalanceUpdate);

    return () => {
      // Отписка при размонтировании
      // wallet.off('transaction_sent', handleTransactionComplete);
      // wallet.off('balance_updated', handleBalanceUpdate);
    };
  }, [wallet.connected, checkAccessStatus]);

  // Форматирование отображения
  const formatPrice = (price: number): string => {
    return musicTokenUtils.formatTokenAmount(price);
  };

  const getActionButtonText = (): string => {
    if (loading) return "Processing...";
    if (hasAccess) return "Access Granted ✓";
    if (balance !== null && balance < (track.ndtRequired || 0)) {
      return `Buy with Stars (${track.price})`;
    }
    return `Buy Access (${formatPrice(track.ndtRequired || track.price)})`;
  };

  const getButtonColor = (): string => {
    if (hasAccess) return "bg-green-500 hover:bg-green-600";
    if (loading) return "bg-gray-400 cursor-not-allowed";
    if (balance !== null && balance < (track.ndtRequired || 0)) {
      return "bg-purple-500 hover:bg-purple-600";
    }
    return "bg-blue-500 hover:bg-blue-600";
  };

  return (
    <div className={`music-access-button ${className}`}>
      <div className="mb-2">
        <h3 className="font-semibold text-lg">{track.title}</h3>
        <p className="text-sm text-gray-600">{track.artist}</p>
        {showBalance && balance !== null && (
          <p className="text-xs text-blue-600 mt-1">
            Balance: {formatPrice(balance)} NDT
          </p>
        )}
      </div>
      
      <button
        onClick={handlePurchaseAccess}
        disabled={disabled || loading || !wallet.connected}
        className={`
          w-full py-2 px-4 rounded-lg text-white font-medium
          transition-colors duration-200
          ${getButtonColor()}
          ${disabled || loading || !wallet.connected ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        {getActionButtonText()}
      </button>

      {/* Отображение статуса */}
      {hasAccess === false && !loading && (
        <div className="mt-2 text-xs text-orange-600">
          No access to this track. Purchase to listen.
        </div>
      )}

      {hasAccess === true && (
        <div className="mt-2 text-xs text-green-600">
          You have access to this track!
        </div>
      )}

      {!wallet.connected && (
        <div className="mt-2 text-xs text-gray-500">
          Connect wallet to purchase access
        </div>
      )}
    </div>
  );
};

export default MusicAccessButton;
