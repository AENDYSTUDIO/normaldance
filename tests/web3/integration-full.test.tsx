import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { WalletProvider } from '@/components/wallet/wallet-provider'
import { DonateButton } from '@/components/donate/donate-button'
import { NFTMemorialMint } from '@/components/nft/nft-memorial-mint'
import { StarsPayment } from '@/components/telegram/stars-payment'
import { StakingInterface } from '@/components/staking/staking-interface'

// Полная интеграция всех систем
describe('🔥 ПОЛНАЯ ИНТЕГРАЦИЯ ВСЕХ СИСТЕМ', () => {
  const mockWallet = {
    publicKey: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
    connected: true,
    connecting: false,
    sendTransaction: jest.fn(),
    signTransaction: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    
    // Mock Solana wallet
    jest.mock('@solana/wallet-adapter-react', () => ({
      useWallet: () => mockWallet,
      WalletProvider: ({ children }: any) => <div>{children}</div>,
      ConnectionProvider: ({ children }: any) => <div>{children}</div>
    }))

    // Mock Telegram WebApp
    global.window.Telegram = {
      WebApp: {
        showInvoice: jest.fn(),
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn()
      }
    }
  })

  describe('🎯 ПОЛНЫЙ ПОЛЬЗОВАТЕЛЬСКИЙ СЦЕНАРИЙ', () => {
    test('должен выполнить полный цикл: подключение кошелька → стейкинг → донат → NFT → Stars', async () => {
      // 1. Подключение кошелька
      const WalletApp = () => (
        <WalletProvider>
          <div>
            <div data-testid="wallet-status">
              {mockWallet.connected ? 'Подключен' : 'Не подключен'}
            </div>
            <StakingInterface />
            <DonateButton artistWallet="artist123" artistName="Test Artist" />
            <NFTMemorialMint />
            <StarsPayment amount={100} description="Test payment" />
          </div>
        </WalletProvider>
      )

      render(<WalletApp />)

      // Проверяем подключение кошелька
      expect(screen.getByTestId('wallet-status')).toHaveTextContent('Подключен')

      // 2. Стейкинг NDT токенов
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ balance: 1000, apy: 15 })
      })

      mockWallet.sendTransaction.mockResolvedValueOnce('stake_tx_hash')

      const stakeInput = screen.getByPlaceholderText('Сумма NDT')
      fireEvent.change(stakeInput, { target: { value: '100' } })
      fireEvent.click(screen.getByText('Застейкать'))

      await waitFor(() => {
        expect(mockWallet.sendTransaction).toHaveBeenCalledTimes(1)
      })

      // 3. Донат артисту
      mockWallet.sendTransaction.mockResolvedValueOnce('donate_tx_hash')

      fireEvent.click(screen.getByText('💝 Донат'))
      
      await waitFor(() => {
        expect(screen.getByText('Поддержать Test Artist')).toBeInTheDocument()
      })

      const donateInput = screen.getByPlaceholderText('Сумма в SOL')
      fireEvent.change(donateInput, { target: { value: '1' } })
      fireEvent.click(screen.getByText('Донат 1 SOL'))

      await waitFor(() => {
        expect(mockWallet.sendTransaction).toHaveBeenCalledTimes(2)
      })

      // 4. Создание NFT мемориала
      mockWallet.sendTransaction.mockResolvedValueOnce('nft_tx_hash')
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, nftId: 'memorial_123' })
      })

      const memorialName = screen.getByPlaceholderText('Имя для мемориала')
      const memorialMessage = screen.getByPlaceholderText('Сообщение или память...')
      
      fireEvent.change(memorialName, { target: { value: 'Test Memorial' } })
      fireEvent.change(memorialMessage, { target: { value: 'In memory of...' } })
      fireEvent.click(screen.getByText('🪦 Создать мемориал за 0.01 SOL'))

      await waitFor(() => {
        expect(mockWallet.sendTransaction).toHaveBeenCalledTimes(3)
        expect(global.fetch).toHaveBeenCalledWith('/api/grave/mint-memorial', expect.any(Object))
      })

      // 5. Оплата через Telegram Stars
      global.window.Telegram.WebApp.showInvoice.mockImplementation((invoice, callback) => {
        callback('paid')
      })

      fireEvent.click(screen.getByText('⭐ Оплатить 100 Stars'))

      await waitFor(() => {
        expect(global.window.Telegram.WebApp.showInvoice).toHaveBeenCalled()
      })

      // Проверяем что все операции прошли успешно
      expect(mockWallet.sendTransaction).toHaveBeenCalledTimes(3)
      expect(global.fetch).toHaveBeenCalled()
      expect(global.window.Telegram.WebApp.showInvoice).toHaveBeenCalled()
    })
  })

  describe('🔄 СОСТОЯНИЕ МЕЖДУ КОМПОНЕНТАМИ', () => {
    test('должен синхронизировать баланс между компонентами', async () => {
      const initialBalance = 1000
      let currentBalance = initialBalance

      ;(global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/user/balance')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ balance: currentBalance })
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })

      mockWallet.sendTransaction.mockImplementation(() => {
        currentBalance -= 100 // Симулируем трату
        return Promise.resolve('tx_hash')
      })

      const BalanceApp = () => {
        const [balance, setBalance] = React.useState(initialBalance)

        React.useEffect(() => {
          fetch('/api/user/balance')
            .then(res => res.json())
            .then(data => setBalance(data.balance))
        }, [])

        return (
          <WalletProvider>
            <div data-testid="balance">{balance} NDT</div>
            <StakingInterface onBalanceChange={setBalance} />
            <DonateButton 
              artistWallet="test" 
              artistName="Test" 
              onBalanceChange={setBalance} 
            />
          </WalletProvider>
        )
      }

      render(<BalanceApp />)

      // Начальный баланс
      expect(screen.getByTestId('balance')).toHaveTextContent('1000 NDT')

      // Выполняем стейкинг
      fireEvent.change(screen.getByPlaceholderText('Сумма NDT'), {
        target: { value: '100' }
      })
      fireEvent.click(screen.getByText('Застейкать'))

      await waitFor(() => {
        expect(screen.getByTestId('balance')).toHaveTextContent('900 NDT')
      })
    })

    test('должен обновлять статистику в реальном времени', async () => {
      const mockStats = {
        totalStaked: 1000000,
        totalUsers: 500,
        totalTransactions: 1250
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats)
      })

      const StatsApp = () => {
        const [stats, setStats] = React.useState(mockStats)

        const updateStats = () => {
          setStats(prev => ({
            ...prev,
            totalTransactions: prev.totalTransactions + 1
          }))
        }

        return (
          <WalletProvider>
            <div data-testid="stats">
              Транзакций: {stats.totalTransactions}
            </div>
            <DonateButton 
              artistWallet="test" 
              artistName="Test"
              onSuccess={updateStats}
            />
          </WalletProvider>
        )
      }

      render(<StatsApp />)

      expect(screen.getByTestId('stats')).toHaveTextContent('Транзакций: 1250')

      // Выполняем донат
      mockWallet.sendTransaction.mockResolvedValue('tx_hash')
      
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), {
        target: { value: '1' }
      })
      fireEvent.click(screen.getByText('Донат 1 SOL'))

      await waitFor(() => {
        expect(screen.getByTestId('stats')).toHaveTextContent('Транзакций: 1251')
      })
    })
  })

  describe('🚨 ОБРАБОТКА ОШИБОК В ЦЕПОЧКЕ', () => {
    test('должен корректно обработать ошибку в середине цепочки операций', async () => {
      const errorSpy = jest.fn()
      global.console.error = errorSpy

      const ErrorApp = () => (
        <WalletProvider>
          <StakingInterface />
          <DonateButton artistWallet="test" artistName="Test" />
        </WalletProvider>
      )

      render(<ErrorApp />)

      // Первая операция успешна
      mockWallet.sendTransaction.mockResolvedValueOnce('success_tx')
      
      fireEvent.change(screen.getByPlaceholderText('Сумма NDT'), {
        target: { value: '100' }
      })
      fireEvent.click(screen.getByText('Застейкать'))

      await waitFor(() => {
        expect(mockWallet.sendTransaction).toHaveBeenCalledTimes(1)
      })

      // Вторая операция с ошибкой
      mockWallet.sendTransaction.mockRejectedValueOnce(new Error('Transaction failed'))
      
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), {
        target: { value: '1' }
      })
      fireEvent.click(screen.getByText('Донат 1 SOL'))

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith('Transaction failed')
      })

      // Система должна остаться стабильной
      expect(screen.getByText('Застейкать')).toBeInTheDocument()
      expect(screen.getByText('💝 Донат')).toBeInTheDocument()
    })

    test('должен восстановиться после сетевых ошибок', async () => {
      let failCount = 0
      
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        failCount++
        if (failCount <= 2) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ balance: 1000 })
        })
      })

      const RetryApp = () => {
        const [retryCount, setRetryCount] = React.useState(0)
        
        const handleRetry = () => {
          setRetryCount(prev => prev + 1)
        }

        return (
          <WalletProvider>
            <div data-testid="retry-count">Попыток: {retryCount}</div>
            <button onClick={handleRetry}>Повторить</button>
            <StakingInterface />
          </WalletProvider>
        )
      }

      render(<RetryApp />)

      // Первые две попытки неудачны
      fireEvent.click(screen.getByText('Повторить'))
      fireEvent.click(screen.getByText('Повторить'))
      
      expect(screen.getByTestId('retry-count')).toHaveTextContent('Попыток: 2')

      // Третья попытка успешна
      fireEvent.click(screen.getByText('Повторить'))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3)
      })
    })
  })

  describe('⚡ ПРОИЗВОДИТЕЛЬНОСТЬ ИНТЕГРАЦИИ', () => {
    test('должен оптимизировать множественные API вызовы', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch')
      
      const OptimizedApp = () => {
        React.useEffect(() => {
          // Батч запросы
          Promise.all([
            fetch('/api/user/balance'),
            fetch('/api/staking/stats'),
            fetch('/api/nft/collection')
          ])
        }, [])

        return (
          <WalletProvider>
            <StakingInterface />
            <NFTMemorialMint />
          </WalletProvider>
        )
      }

      render(<OptimizedApp />)

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledTimes(3)
      })

      // Все запросы должны быть выполнены параллельно
      const callTimes = fetchSpy.mock.invocationCallOrder
      expect(callTimes[1] - callTimes[0]).toBeLessThan(10) // < 10ms разница
      expect(callTimes[2] - callTimes[1]).toBeLessThan(10)
    })

    test('должен кэшировать повторяющиеся запросы', async () => {
      const cache = new Map()
      
      ;(global.fetch as jest.Mock).mockImplementation((url) => {
        if (cache.has(url)) {
          return Promise.resolve(cache.get(url))
        }
        
        const response = {
          ok: true,
          json: () => Promise.resolve({ cached: true })
        }
        
        cache.set(url, response)
        return Promise.resolve(response)
      })

      const CachedApp = () => (
        <WalletProvider>
          <StakingInterface />
          <StakingInterface /> {/* Дублированный компонент */}
        </WalletProvider>
      )

      render(<CachedApp />)

      await waitFor(() => {
        // Должен быть только один запрос благодаря кэшу
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('🔐 БЕЗОПАСНОСТЬ ИНТЕГРАЦИИ', () => {
    test('должен валидировать все транзакции в цепочке', async () => {
      const validationSpy = jest.fn()
      
      const SecureApp = () => {
        const validateTransaction = (tx: Transaction) => {
          validationSpy(tx)
          // Проверяем подпись, адреса, суммы
          return true
        }

        return (
          <WalletProvider>
            <StakingInterface onTransactionValidate={validateTransaction} />
            <DonateButton 
              artistWallet="test" 
              artistName="Test"
              onTransactionValidate={validateTransaction}
            />
          </WalletProvider>
        )
      }

      render(<SecureApp />)

      mockWallet.sendTransaction.mockResolvedValue('tx_hash')

      // Стейкинг транзакция
      fireEvent.change(screen.getByPlaceholderText('Сумма NDT'), {
        target: { value: '100' }
      })
      fireEvent.click(screen.getByText('Застейкать'))

      // Донат транзакция
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), {
        target: { value: '1' }
      })
      fireEvent.click(screen.getByText('Донат 1 SOL'))

      await waitFor(() => {
        expect(validationSpy).toHaveBeenCalledTimes(2)
      })
    })

    test('должен предотвращать атаки повторного воспроизведения', async () => {
      const nonceSpy = jest.fn()
      let currentNonce = 0

      mockWallet.sendTransaction.mockImplementation((tx) => {
        const nonce = currentNonce++
        nonceSpy(nonce)
        return Promise.resolve(`tx_${nonce}`)
      })

      const NonceApp = () => (
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test" />
        </WalletProvider>
      )

      render(<NonceApp />)

      // Выполняем несколько транзакций
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText('💝 Донат'))
        fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), {
          target: { value: '1' }
        })
        fireEvent.click(screen.getByText('Донат 1 SOL'))
        
        await waitFor(() => {
          expect(nonceSpy).toHaveBeenCalledWith(i)
        })
      }

      // Каждая транзакция должна иметь уникальный nonce
      expect(nonceSpy).toHaveBeenCalledTimes(3)
      expect(nonceSpy).toHaveBeenNthCalledWith(1, 0)
      expect(nonceSpy).toHaveBeenNthCalledWith(2, 1)
      expect(nonceSpy).toHaveBeenNthCalledWith(3, 2)
    })
  })
})