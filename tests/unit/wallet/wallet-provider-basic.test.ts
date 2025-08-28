import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletProviderWrapper, WalletStatus, WalletConnectButton, useWalletContext, withWallet } from '@/components/wallet/wallet-provider'
import { WalletConnect } from '@/components/wallet/wallet-connect'
import { walletEmitter } from '@/components/wallet/wallet-adapter'

// Mock external dependencies
jest.mock('@/components/wallet/wallet-adapter')
jest.mock('@/components/wallet/wallet-connect')
jest.mock('@solana/web3.js')
jest.mock('@solana/wallet-adapter-base')
jest.mock('@solana/wallet-adapter-react')
jest.mock('@solana/wallet-adapter-react-ui')

// Mock the wallet hook
const mockUseWallet = require('@solana/wallet-adapter-react').useWallet
const mockUseConnection = require('@solana/wallet-adapter-react').useConnection
const mockClusterApiUrl = require('@solana/web3.js').clusterApiUrl

describe('WalletProvider - Basic Tests', () => {
  const mockWallet = {
    connected: false,
    publicKey: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }

  const mockConnection = {
    getBalance: jest.fn(),
    onAccountChange: jest.fn(),
    removeAccountChangeListener: jest.fn(),
    getLatestBlockhash: jest.fn(),
    sendRawTransaction: jest.fn(),
    confirmTransaction: jest.fn(),
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockUseWallet.mockReturnValue(mockWallet)
    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockClusterApiUrl.mockReturnValue('https://api.devnet.solana.com')
    
    // Mock wallet emitter
    walletEmitter.emit = jest.fn()
  })

  describe('WalletProviderWrapper', () => {
    it('should render children with wallet providers', () => {
      const TestComponent = () => <div>Test Content</div>
      
      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should use correct network and endpoint', () => {
      const TestComponent = () => <div>Test Content</div>
      
      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      )
      
      expect(mockClusterApiUrl).toHaveBeenCalledWith('devnet')
    })
  })

  describe('WalletStatus', () => {
    it('should not render when wallet is not connected', () => {
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      expect(screen.queryByText('1111...1111')).not.toBeInTheDocument()
    })

    it('should render wallet status when connected', () => {
      mockWallet.connected = true
      mockWallet.publicKey = { toBase58: () => '1111111111111111111111111111111111111111111' }
      mockConnection.getBalance.mockResolvedValue(1000000000) // 1 SOL
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('1111...1111')).toBeInTheDocument()
      expect(screen.getByText('1.0000 SOL')).toBeInTheDocument()
    })
  })

  describe('WalletConnectButton', () => {
    it('should show connect button when wallet is not connected', () => {
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Подключить кошелек')).toBeInTheDocument()
    })

    it('should show disconnect button when wallet is connected', () => {
      mockWallet.connected = true
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Отключить')).toBeInTheDocument()
    })

    it('should call connect when connect button is clicked', async () => {
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockWallet.connect).toHaveBeenCalledTimes(1)
      })
    })

    it('should call disconnect when disconnect button is clicked', async () => {
      mockWallet.connected = true
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const disconnectButton = screen.getByText('Отключить')
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(mockWallet.disconnect).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle connection error', async () => {
      mockWallet.connect.mockRejectedValue(new Error('Connection failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockWallet.connect).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('withWallet HOC', () => {
    it('should render wrapped component when wallet is connected', () => {
      mockWallet.connected = true
      
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Wrapped Component')).toBeInTheDocument()
    })

    it('should render fallback when wallet is not connected', () => {
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent, <div>Fallback</div>)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Fallback')).toBeInTheDocument()
    })

    it('should render default fallback when wallet is not connected', () => {
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Пожалуйста, подключите кошелек для использования этой функции')).toBeInTheDocument()
    })

    it('should render WalletConnect when wallet is not connected', () => {
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Пожалуйста, подключите ваш Solana кошелек')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle wallet connection errors', async () => {
      mockWallet.connect.mockRejectedValue(new Error('Connection failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockWallet.connect).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle wallet disconnection errors', async () => {
      mockWallet.connected = true
      mockWallet.disconnect.mockRejectedValue(new Error('Disconnection failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const disconnectButton = screen.getByText('Отключить')
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(mockWallet.disconnect).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle balance fetch errors', async () => {
      mockWallet.connected = true
      mockWallet.publicKey = { toBase58: () => '1111111111111111111111111111111111111111111' }
      mockConnection.getBalance.mockRejectedValue(new Error('Balance fetch failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error getting balance:', expect.any(Error))
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null publicKey gracefully', () => {
      mockWallet.connected = true
      mockWallet.publicKey = null
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      // Should not crash
      expect(true).toBe(true)
    })

    it('should handle missing wallet object', () => {
      mockUseWallet.mockReturnValue({})
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      // Should not crash
      expect(true).toBe(true)
    })

    it('should handle missing connection object', () => {
      mockUseConnection.mockReturnValue({})
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      // Should not crash
      expect(true).toBe(true)
    })
  })
})