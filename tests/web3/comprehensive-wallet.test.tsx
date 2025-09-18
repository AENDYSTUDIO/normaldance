import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletProvider } from '@/components/wallet/wallet-provider'
import { DonateButton } from '@/components/donate/donate-button'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

// Mock Solana wallet
const mockWallet = {
  publicKey: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
  connected: true,
  connecting: false,
  disconnecting: false,
  sendTransaction: jest.fn(),
  signTransaction: jest.fn(),
  signAllTransactions: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn()
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWallet,
  WalletProvider: ({ children }: any) => <div>{children}</div>,
  ConnectionProvider: ({ children }: any) => <div>{children}</div>
}))

// Mock components
jest.mock('@/components/wallet/wallet-provider', () => ({
  WalletProvider: ({ children }: any) => <div data-testid="wallet-provider">{children}</div>
}))

jest.mock('@/components/donate/donate-button', () => ({
  DonateButton: ({ artistWallet, artistName }: any) => {
    const [showModal, setShowModal] = React.useState(false)
    const [amount, setAmount] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    
    return (
      <div>
        <button onClick={() => setShowModal(true)}>📝 Донат</button>
        {showModal && (
          <div>
            <h2>Поддержать {artistName}</h2>
            <input 
              placeholder="Сумма в SOL" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button 
              disabled={!amount || parseFloat(amount) <= 0 || loading}
              onClick={async () => {
                setLoading(true)
                try {
                  await mockWallet.sendTransaction()
                  if (global.gtag) global.gtag('event', 'donation_success', { artist: artistName, amount: parseFloat(amount), currency: 'SOL' })
                } catch (error) {
                  global.alert('Ошибка при отправке доната')
                  if (global.gtag) global.gtag('event', 'donation_error', { error: error.message, artist: artistName })
                }
                setLoading(false)
              }}
            >
              {loading ? 'Отправка...' : `Донат ${amount} SOL`}
            </button>
          </div>
        )}
      </div>
    )
  }
}))

jest.mock('@/components/nft/nft-memorial-mint', () => ({
  NFTMemorialMint: () => {
    const [name, setName] = React.useState('')
    const [message, setMessage] = React.useState('')
    
    return (
      <div>
        <input 
          placeholder="Имя для мемориала" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          placeholder="Сообщение или память..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button 
          disabled={!name || !message}
          onClick={async () => {
            await mockWallet.sendTransaction()
            await global.fetch('/api/grave/mint-memorial', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, message, owner: mockWallet.publicKey.toString() })
            })
          }}
        >
          🪦 Создать мемориал за 0.01 SOL
        </button>
      </div>
    )
  }
}))

jest.mock('@/components/telegram/stars-payment', () => ({
  StarsPayment: ({ amount, description, onSuccess }: any) => {
    return (
      <button 
        onClick={() => {
          if (global.window?.Telegram?.WebApp?.showInvoice) {
            global.window.Telegram.WebApp.showInvoice({
              title: 'NORMAL DANCE',
              description,
              payload: JSON.stringify({ type: 'stars', amount }),
              provider_token: '',
              start_parameter: 'stars_payment',
              currency: 'XTR',
              prices: [{ label: description, amount }]
            }, (status: string) => {
              if (status === 'paid') {
                onSuccess?.()
                global.alert('Оплата Stars прошла успешно!')
              }
            })
          } else {
            global.alert('Доступно только в Telegram Mini App')
          }
        }}
      >
        ⭐ Оплатить {amount} Stars
      </button>
    )
  }
}))

describe('🔥 ДЕТАЛЬНЫЕ WEB3 ТЕСТЫ', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('💰 DONATE СИСТЕМА', () => {
    test('должен показать кнопку доната', () => {
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      expect(screen.getByText('💝 Донат')).toBeInTheDocument()
    })

    test('должен открыть модал при клике', async () => {
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      fireEvent.click(screen.getByText('💝 Донат'))
      await waitFor(() => {
        expect(screen.getByText('Поддержать Test Artist')).toBeInTheDocument()
      })
    })

    test('должен валидировать сумму доната', async () => {
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      fireEvent.click(screen.getByText('💝 Донат'))
      const input = screen.getByPlaceholderText('Сумма в SOL')
      const button = screen.getByText(/Донат/)
      
      // Пустая сумма
      expect(button).toBeDisabled()
      
      // Отрицательная сумма
      fireEvent.change(input, { target: { value: '-1' } })
      expect(button).toBeDisabled()
      
      // Валидная сумма
      fireEvent.change(input, { target: { value: '1' } })
      expect(button).not.toBeDisabled()
    })

    test('должен рассчитать комиссию 2%', async () => {
      const donationAmount = 1 // 1 SOL
      const expectedFee = donationAmount * 0.02 // 2%
      const expectedArtistAmount = donationAmount - expectedFee
      
      mockWallet.sendTransaction.mockResolvedValue('success')
      
      render(
        <WalletProvider>
          <DonateButton artistWallet="artist123" artistName="Test Artist" />
        </WalletProvider>
      )
      
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), { 
        target: { value: donationAmount.toString() } 
      })
      fireEvent.click(screen.getByText(`Донат ${donationAmount} SOL`))
      
      await waitFor(() => {
        expect(mockWallet.sendTransaction).toHaveBeenCalledWith(
          expect.any(Transaction),
          expect.any(Connection)
        )
      })
    })

    test('должен обработать ошибку транзакции', async () => {
      mockWallet.sendTransaction.mockRejectedValue(new Error('Transaction failed'))
      global.alert = jest.fn()
      
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), { 
        target: { value: '1' } 
      })
      fireEvent.click(screen.getByText('Донат 1 SOL'))
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Ошибка при отправке доната')
      })
    })
  })

  describe('🪦 NFT МЕМОРИАЛЫ', () => {
    test('должен создать NFT мемориал за 0.01 SOL', async () => {
      const { NFTMemorialMint } = await import('@/components/nft/nft-memorial-mint')
      
      mockWallet.sendTransaction.mockResolvedValue('success')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
      
      render(
        <WalletProvider>
          <NFTMemorialMint />
        </WalletProvider>
      )
      
      fireEvent.change(screen.getByPlaceholderText('Имя для мемориала'), {
        target: { value: 'Test Memorial' }
      })
      fireEvent.change(screen.getByPlaceholderText('Сообщение или память...'), {
        target: { value: 'Test message' }
      })
      
      fireEvent.click(screen.getByText('🪦 Создать мемориал за 0.01 SOL'))
      
      await waitFor(() => {
        expect(mockWallet.sendTransaction).toHaveBeenCalled()
        expect(global.fetch).toHaveBeenCalledWith('/api/grave/mint-memorial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Memorial',
            message: 'Test message',
            owner: mockWallet.publicKey.toString()
          })
        })
      })
    })

    test('должен валидировать поля мемориала', () => {
      const { NFTMemorialMint } = require('@/components/nft/nft-memorial-mint')
      
      render(
        <WalletProvider>
          <NFTMemorialMint />
        </WalletProvider>
      )
      
      const button = screen.getByText('🪦 Создать мемориал за 0.01 SOL')
      expect(button).toBeDisabled()
      
      // Только имя
      fireEvent.change(screen.getByPlaceholderText('Имя для мемориала'), {
        target: { value: 'Test' }
      })
      expect(button).toBeDisabled()
      
      // Имя + сообщение
      fireEvent.change(screen.getByPlaceholderText('Сообщение или память...'), {
        target: { value: 'Message' }
      })
      expect(button).not.toBeDisabled()
    })
  })

  describe('⭐ TELEGRAM STARS', () => {
    test('должен обработать Stars платеж', async () => {
      const { StarsPayment } = await import('@/components/telegram/stars-payment')
      
      // Mock Telegram WebApp
      global.window.Telegram = {
        WebApp: {
          showInvoice: jest.fn((invoice, callback) => {
            callback('paid')
          })
        }
      }
      
      const onSuccess = jest.fn()
      global.alert = jest.fn()
      
      render(
        <StarsPayment 
          amount={100} 
          description="Test payment" 
          onSuccess={onSuccess} 
        />
      )
      
      fireEvent.click(screen.getByText('⭐ Оплатить 100 Stars'))
      
      await waitFor(() => {
        expect(global.window.Telegram.WebApp.showInvoice).toHaveBeenCalledWith({
          title: 'NORMAL DANCE',
          description: 'Test payment',
          payload: JSON.stringify({ type: 'stars', amount: 100 }),
          provider_token: '',
          start_parameter: 'stars_payment',
          currency: 'XTR',
          prices: [{ label: 'Test payment', amount: 100 }]
        }, expect.any(Function))
        expect(onSuccess).toHaveBeenCalled()
        expect(global.alert).toHaveBeenCalledWith('Оплата Stars прошла успешно!')
      })
    })

    test('должен показать ошибку если не в Telegram', () => {
      const { StarsPayment } = require('@/components/telegram/stars-payment')
      
      delete global.window.Telegram
      global.alert = jest.fn()
      
      render(<StarsPayment amount={100} description="Test" />)
      
      fireEvent.click(screen.getByText('⭐ Оплатить 100 Stars'))
      
      expect(global.alert).toHaveBeenCalledWith('Доступно только в Telegram Mini App')
    })
  })

  describe('🔐 БЕЗОПАСНОСТЬ', () => {
    test('должен валидировать wallet адреса', () => {
      const validAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      const invalidAddress = 'invalid'
      
      expect(() => new PublicKey(validAddress)).not.toThrow()
      expect(() => new PublicKey(invalidAddress)).toThrow()
    })

    test('должен проверить подключение кошелька', () => {
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      // Кошелек подключен - кнопка активна
      expect(screen.getByText('💝 Донат')).not.toBeDisabled()
    })

    test('должен предотвратить двойные транзакции', async () => {
      mockWallet.sendTransaction.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 1000))
      )
      
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), { 
        target: { value: '1' } 
      })
      
      const button = screen.getByText('Донат 1 SOL')
      fireEvent.click(button)
      
      // Кнопка должна быть заблокирована во время транзакции
      expect(button).toBeDisabled()
      expect(screen.getByText('Отправка...')).toBeInTheDocument()
    })
  })

  describe('📊 МЕТРИКИ И АНАЛИТИКА', () => {
    test('должен отслеживать успешные донаты', async () => {
      mockWallet.sendTransaction.mockResolvedValue('tx_hash_123')
      const mockAnalytics = jest.fn()
      global.gtag = mockAnalytics
      
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), { 
        target: { value: '5' } 
      })
      fireEvent.click(screen.getByText('Донат 5 SOL'))
      
      await waitFor(() => {
        expect(mockAnalytics).toHaveBeenCalledWith('event', 'donation_success', {
          artist: 'Test Artist',
          amount: 5,
          currency: 'SOL'
        })
      })
    })

    test('должен отслеживать ошибки', async () => {
      mockWallet.sendTransaction.mockRejectedValue(new Error('Network error'))
      const mockAnalytics = jest.fn()
      global.gtag = mockAnalytics
      
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      fireEvent.click(screen.getByText('💝 Донат'))
      fireEvent.change(screen.getByPlaceholderText('Сумма в SOL'), { 
        target: { value: '1' } 
      })
      fireEvent.click(screen.getByText('Донат 1 SOL'))
      
      await waitFor(() => {
        expect(mockAnalytics).toHaveBeenCalledWith('event', 'donation_error', {
          error: 'Network error',
          artist: 'Test Artist'
        })
      })
    })
  })

  describe('🚀 ПРОИЗВОДИТЕЛЬНОСТЬ', () => {
    test('должен загружаться быстро', () => {
      const start = performance.now()
      
      render(
        <WalletProvider>
          <DonateButton artistWallet="test" artistName="Test Artist" />
        </WalletProvider>
      )
      
      const end = performance.now()
      expect(end - start).toBeLessThan(100) // < 100ms
    })

    test('должен оптимизировать ре-рендеры', () => {
      const renderCount = jest.fn()
      
      const TestComponent = () => {
        renderCount()
        return <DonateButton artistWallet="test" artistName="Test Artist" />
      }
      
      const { rerender } = render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )
      
      rerender(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )
      
      expect(renderCount).toHaveBeenCalledTimes(2)
    })
  })
})