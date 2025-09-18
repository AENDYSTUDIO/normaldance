'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Copy, 
  ExternalLink,
  Loader2,
  AlertCircle,
  QrCode
} from '@/components/icons'
import { useSolanaWallet } from './wallet-adapter'
import { formatAddress } from './wallet-adapter'
import { cn } from '@/lib/utils'

interface WalletConnectProps {
  className?: string
}

export const WalletConnect = memo(function WalletConnect({ className }: WalletConnectProps) {
  const {
    connected,
    publicKey,
    balance,
    connectWallet,
    disconnectWallet,
    getBalance,
    getTokenBalance,
    formatSol
  } = useSolanaWallet()

  const [isConnecting, setIsConnecting] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      loadBalance()
    }
  }, [connected, publicKey])

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true)
    try {
      await getBalance()
      const ndtBalance = await getTokenBalance('NDT_MINT_ADDRESS')
      // Store NDT balance in state if needed
    } catch (err) {
      setError('Не удалось загрузить баланс')
    } finally {
      setBalanceLoading(false)
    }
  }, [getBalance, getTokenBalance])

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await connectWallet()
      setShowQR(false)
    } catch (err) {
      setError('Не удалось подключить кошелек')
      console.error('Connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [connectWallet])

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectWallet()
    } catch (err) {
      console.error('Disconnection error:', err)
      setError('Не удалось отключить кошелек')
    }
  }, [disconnectWallet])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Можно добавить toast уведомление
    } catch (err) {
      console.error('Failed to copy:', err)
      setError('Не удалось скопировать адрес')
    }
  }, [])

  if (connected && publicKey) {
    return (
      <Card className={cn('w-full max-w-md', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Кошелек подключен
          </CardTitle>
          <CardDescription>
            Ваш Solana кошелек успешно подключен
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet address */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>Ξ</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {formatAddress(publicKey, 6)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Solana
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(publicKey.toBase58())}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">SOL Balance</span>
              {balanceLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span className="text-sm font-medium">
                  {formatSol ? formatSol(balance || 0) : (balance || 0).toFixed(4)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">NDT Balance</span>
              <span className="text-sm font-medium">0</span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            <Badge variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Mainnet
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowQR(!showQR)}
              className="flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDisconnect}
              className="flex-1"
            >
              Отключить
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Подключить кошелек
        </CardTitle>
        <CardDescription>
          Подключите ваш Web3 кошелек для доступа к платформе
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet options */}
        <div className="space-y-2">
          <Button
            className="w-full justify-start"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-purple-600 rounded"></div>
                Phantom Wallet
              </div>
            )}
          </Button>
        </div>

        {/* Features */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Полный контроль над вашими средствами</p>
          <p>✓ Безопасные транзакции</p>
          <p>✓ Поддержка NFT и токенов</p>
          <p>✓ Децентрализованный доступ</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {/* Need help */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Нужна помощь? Посетите нашу документацию</p>
        </div>
      </CardContent>
    </Card>
  )
})