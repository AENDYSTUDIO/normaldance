import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WalletConnect } from '../wallet-connect'
import { useSolanaWallet } from '../wallet-adapter'
import { walletEmitter } from '../wallet-adapter'
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react'
// Интерфейс для мока useSolanaWallet
interface MockSolanaWallet {
  connected: boolean
  publicKey: any | null
  connect: jest.Mock
  disconnect: jest.Mock
  balance: number | null
}


// Mock the wallet adapter hook
jest.mock('../wallet-adapter', () => ({
  useSolanaWallet: jest.fn(),
  formatAddress: jest.fn((address) => address.toBase58().slice(0, 4) + '...' + address.toBase58().slice(-4)),
  walletEmitter: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
}))

// Mock window.solana
Object.defineProperty(window, 'solana', {
  writable: true,
  value: {
    isPhantom: true,
    connect: jest.fn(),
    disconnect: jest.fn()
  }
})

describe('WalletConnect - Unit Tests', () => {
  const mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render connection card when wallet is not connected', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      expect(screen.getByText('Подключение кошелька')).toBeInTheDocument()
      expect(screen.getByText('Подключите ваш Solana кошелек для использования платформы')).toBeInTheDocument()
      expect(screen.getByText('Подключить Phantom кошелек')).toBeInTheDocument()
    })

    it('should render connected wallet card when wallet is connected', () => {
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: 1.5
      })

      render(<WalletConnect />)
      
      expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
      expect(screen.getByText('Ваш Solana кошелек успешно подключен')).toBeInTheDocument()
      expect(screen.getByText('Отключить кошелек')).toBeInTheDocument()
    })

    it('should show loading state when connecting', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      expect(connectButton).toHaveTextContent('Подключение...')
      expect(screen.getByRole('button', { name: /подключить/i })).toBeDisabled()
    })
  })

  describe('Event Handling', () => {
    it('should handle connect event', () => {
      const mockOnConnect = jest.fn()
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: mockPublicKey,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect onConnect={mockOnConnect} />)
      
      // Simulate wallet connect event
      walletEmitter.emit('connect', mockPublicKey.toBase58())
      
      expect(mockOnConnect).toHaveBeenCalledWith(mockPublicKey.toBase58())
    })

    it('should handle disconnect event', () => {
      const mockOnDisconnect = jest.fn()
      
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: 1.5
      })

      render(<WalletConnect onDisconnect={mockOnDisconnect} />)
      
      // Simulate wallet disconnect event
      walletEmitter.emit('disconnect')
      
      expect(mockOnDisconnect).toHaveBeenCalled()
    })

    it('should handle error event', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      // Simulate error event
      walletEmitter.emit('error', new Error('Test error'))
      
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })
  })

  describe('Wallet Connection', () => {
    it('should attempt to connect when connect button is clicked', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined)
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: mockConnect,
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled()
      })
    })

    it('should show error when Phantom wallet is not found', async () => {
      // Mock window.solana without Phantom
      Object.defineProperty(window, 'solana', {
        writable: true,
        value: {
          isPhantom: false
        }
      })

      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByText('Phantom кошелек не найден')).toBeInTheDocument()
      })
    })

    it('should show error when Phantom wallet is not installed', async () => {
      // Mock window without solana
      Object.defineProperty(window, 'solana', {
        writable: true,
        value: undefined
      })

      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByText('Пожалуйста, установите Phantom кошелек')).toBeInTheDocument()
      })
    })

    it('should handle connection errors gracefully', async () => {
      const mockConnect = jest.fn().mockRejectedValue(new Error('Connection failed'))
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: mockConnect,
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка подключения')).toBeInTheDocument()
      })
    })
  })

  describe('Wallet Disconnection', () => {
    it('should attempt to disconnect when disconnect button is clicked', async () => {
      const mockDisconnect = jest.fn().mockResolvedValue(undefined)
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
        connect: jest.fn(),
        disconnect: mockDisconnect,
        balance: 1.5
      })

      render(<WalletConnect />)
      
      const disconnectButton = screen.getByRole('button', { name: /отключить/i })
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled()
      })
    })

    it('should show error when disconnection fails', async () => {
      const mockDisconnect = jest.fn().mockRejectedValue(new Error('Disconnection failed'))
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
        connect: jest.fn(),
        disconnect: mockDisconnect,
        balance: 1.5
      })

      render(<WalletConnect />)
      
      const disconnectButton = screen.getByRole('button', { name: /отключить/i })
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка отключения')).toBeInTheDocument()
      })
    })
  })

  describe('Props Handling', () => {
    it('should call onConnect callback when wallet connects', async () => {
      const mockOnConnect = jest.fn()
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: mockPublicKey,
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect onConnect={mockOnConnect} />)
      
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockOnConnect).toHaveBeenCalledWith(mockPublicKey.toBase58())
      })
    })

    it('should call onDisconnect callback when wallet disconnects', async () => {
      const mockOnDisconnect = jest.fn()
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
        connect: jest.fn(),
        disconnect: jest.fn().mockResolvedValue(undefined),
        balance: 1.5
      })

      render(<WalletConnect onDisconnect={mockOnDisconnect} />)
      
      const disconnectButton = screen.getByRole('button', { name: /отключить/i })
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(mockOnDisconnect).toHaveBeenCalled()
      })
    })
  })

  describe('UI Elements', () => {
    it('should display wallet information when connected', () => {
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: 2.5
      })

      render(<WalletConnect />)
      
      expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
      expect(screen.getByText('Ваш Solana кошелек успешно подключен')).toBeInTheDocument()
      expect(screen.getByText('Адрес:')).toBeInTheDocument()
      expect(screen.getByText('Тип:')).toBeInTheDocument()
      expect(screen.getByText('Баланс:')).toBeInTheDocument()
      expect(screen.getByText('2.5000 SOL')).toBeInTheDocument()
    })

    it('should show requirements section', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      expect(screen.getByText('Требуется:')).toBeInTheDocument()
      expect(screen.getByText('Установленный Phantom кошелек')).toBeInTheDocument()
      expect(screen.getByText('Некоторые SOL для оплаты транзакций')).toBeInTheDocument()
      expect(screen.getByText('Подключение к интернету')).toBeInTheDocument()
    })

    it('should show loading spinner when connecting', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      expect(screen.getByRole('button', { name: /подключение/i })).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('should display error message when error occurs', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      // Simulate error
      walletEmitter.emit('error', new Error('Test error'))
      
      expect(screen.getByText('Test error')).toBeInTheDocument()
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    })

    it('should clear error when connection succeeds', async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined)
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: mockConnect,
        disconnect: jest.fn(),
        
      })

      render(<WalletConnect />)
      
      // Simulate error first
      walletEmitter.emit('error', new Error('Test error'))
      
      // Then simulate successful connection
      const connectButton = screen.getByRole('button', { name: /подключить/i })
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Test error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const mockOnConnect = jest.fn()
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        
      })

      const { unmount } = render(<WalletConnect onConnect={mockOnConnect} />)
      
      unmount()
      
      expect(walletEmitter.off).toHaveBeenCalledTimes(3) // connect, disconnect, error
    })
  })
})

describe('WalletConnect - Integration Tests', () => {
  let mockUseSolanaWallet: jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>
    jest.clearAllMocks()
  })

  it('should integrate with wallet adapter hook', () => {
    const mockWallet = {
      connected: false,
      publicKey: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      
    }

    mockUseSolanaWallet.mockReturnValue(mockWallet)

    render(<WalletConnect />)

    expect(mockUseSolanaWallet).toHaveBeenCalled()
  })

  it('should handle wallet state changes', async () => {
    let walletState = {
      connected: false,
      publicKey: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      
    }

    mockUseSolanaWallet.mockReturnValue(walletState)

    const { rerender } = render(<WalletConnect />)

    // Initially not connected
    expect(screen.getByText('Подключение кошелька')).toBeInTheDocument()

    // Simulate wallet connection
    walletState = {
      connected: true,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 1.0
    }
    mockUseSolanaWallet.mockReturnValue(walletState)
    rerender(<WalletConnect />)

    await waitFor(() => {
      expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
    })
  })

  it('should handle multiple connection attempts', async () => {
    const mockConnect = jest.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(undefined)

    mockUseSolanaWallet.mockReturnValue({
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: jest.fn(),
      
    })

    render(<WalletConnect />)

    const connectButton = screen.getByRole('button', { name: /подключить/i })
    
    // First attempt fails
    fireEvent.click(connectButton)
    await waitFor(() => {
      expect(screen.getByText('Ошибка подключения')).toBeInTheDocument()
    })

    // Second attempt succeeds
    fireEvent.click(connectButton)
    await waitFor(() => {
      expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
    })
  })
})

describe('WalletConnect - Error Handling Tests', () => {
  let mockUseSolanaWallet: jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>
    jest.clearAllMocks()
  })

  it('should handle network errors during connection', async () => {
    const mockConnect = jest.fn().mockRejectedValue(new Error('Network error'))
    mockUseSolanaWallet.mockReturnValue({
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: jest.fn(),
      
    })

    render(<WalletConnect />)

    const connectButton = screen.getByRole('button', { name: /подключить/i })
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText('Ошибка подключения')).toBeInTheDocument()
    })
  })

  it('should handle timeout errors', async () => {
    const mockConnect = jest.fn().mockRejectedValue(new Error('Connection timeout'))
    mockUseSolanaWallet.mockReturnValue({
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: jest.fn(),
      
    })

    render(<WalletConnect />)

    const connectButton = screen.getByRole('button', { name: /подключить/i })
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText('Ошибка подключения')).toBeInTheDocument()
    })
  })

  it('should handle user cancellation', async () => {
    const mockConnect = jest.fn().mockRejectedValue(new Error('User cancelled'))
    mockUseSolanaWallet.mockReturnValue({
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: jest.fn(),
      
    })

    render(<WalletConnect />)

    const connectButton = screen.getByRole('button', { name: /подключить/i })
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText('Ошибка подключения')).toBeInTheDocument()
    })
  })
})

describe('WalletConnect - Edge Cases Tests', () => {
  let mockUseSolanaWallet: jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>
    jest.clearAllMocks()
  })

  it('should handle very long public keys', () => {
    const longPublicKey = new PublicKey('1'.repeat(44))
    mockUseSolanaWallet.mockReturnValue({
      connected: true,
      publicKey: longPublicKey,
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 1.0
    })

    render(<WalletConnect />)

    expect(screen.getByText('Адрес:')).toBeInTheDocument()
    // The address should be formatted correctly
  })

  it('should handle zero balance', () => {
    const mockPublicKey = new PublicKey('11111111111111111111111111111111')
    mockUseSolanaWallet.mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 0
    })

    render(<WalletConnect />)

    expect(screen.getByText('0.0000 SOL')).toBeInTheDocument()
  })

  it('should handle very large balance', () => {
    const mockPublicKey = new PublicKey('11111111111111111111111111111111')
    mockUseSolanaWallet.mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 1000000
    })

    render(<WalletConnect />)

    expect(screen.getByText('1000000.0000 SOL')).toBeInTheDocument()
  })

  it('should handle rapid connection/disconnection', async () => {
    const mockConnect = jest.fn().mockResolvedValue(undefined)
    const mockDisconnect = jest.fn().mockResolvedValue(undefined)

    let walletState = {
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
      
    }

    mockUseSolanaWallet.mockReturnValue(walletState)

    const { rerender } = render(<WalletConnect />)

    // Connect
    walletState = {
      connected: true,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      connect: mockConnect,
      disconnect: mockDisconnect,
      balance: 1.0
    }
    mockUseSolanaWallet.mockReturnValue(walletState)
    rerender(<WalletConnect />)

    await waitFor(() => {
      expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
    })

    // Disconnect
    walletState = {
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
      
    }
    mockUseSolanaWallet.mockReturnValue(walletState)
    rerender(<WalletConnect />)

    await waitFor(() => {
      expect(screen.getByText('Подключение кошелька')).toBeInTheDocument()
    })
  })

  it('should handle concurrent connection attempts', async () => {
    const mockConnect = jest.fn().mockResolvedValue(undefined)
    mockUseSolanaWallet.mockReturnValue({
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: jest.fn(),
      
    })

    render(<WalletConnect />)

    const connectButton = screen.getByRole('button', { name: /подключить/i })
    
    // Click multiple times rapidly
    fireEvent.click(connectButton)
    fireEvent.click(connectButton)
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledTimes(1) // Should only call once
    })
  })
})

// Helper to import PublicKey
import { PublicKey } from '@solana/web3.js'