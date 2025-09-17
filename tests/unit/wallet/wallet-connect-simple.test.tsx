import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletConnect } from '@/components/wallet/wallet-connect'
import { useSolanaWallet } from '@/components/wallet/wallet-adapter'

// Mock external dependencies
jest.mock('@/components/wallet/wallet-adapter')

// Mock the wallet hook
const mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>

describe('WalletConnect - Basic Tests', () => {
  const mockWallet = {
    connected: false,
    publicKey: null,
    balance: null,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    getBalance: jest.fn(),
    getTokenBalance: jest.fn(),
    formatSol: jest.fn((amount: number) => amount.toFixed(2))
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default mock implementation
    mockUseSolanaWallet.mockReturnValue(mockWallet)
  })

  describe('Rendering States', () => {
    it('should render disconnected state when wallet is not connected', () => {
      render(<WalletConnect />)
      
      expect(screen.getByText('Подключить кошелек')).toBeInTheDocument()
      expect(screen.getByText('Пожалуйста, подключите ваш Solana кошелек')).toBeInTheDocument()
    })

    it('should render connected state when wallet is connected', () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
      expect(screen.getByText('1111...1111')).toBeInTheDocument()
      expect(screen.getByText('2.50 SOL')).toBeInTheDocument()
    })

    it('should show loading state when connecting', () => {
      const connectingWallet = {
        ...mockWallet,
        connected: false,
        publicKey: null,
        isConnecting: true
      }

      mockUseSolanaWallet.mockReturnValue(connectingWallet as any)

      render(<WalletConnect />)
      
      expect(screen.getByText('Подключение...')).toBeInTheDocument()
    })
  })

  describe('Connection Flow', () => {
    it('should call connectWallet when connect button is clicked', async () => {
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockWallet.connectWallet).toHaveBeenCalledTimes(1)
      })
    })

    it('should show error message when connection fails', async () => {
      mockWallet.connectWallet.mockRejectedValue(new Error('Connection failed'))
      
      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to connect wallet')).toBeInTheDocument()
      })
    })

    it('should not call connectWallet when already connected', () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' }
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      const connectButton = screen.getByText('Отключить')
      fireEvent.click(connectButton)
      
      expect(mockWallet.connectWallet).not.toHaveBeenCalled()
    })
  })

  describe('Disconnection Flow', () => {
    it('should call disconnectWallet when disconnect button is clicked', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' }
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      const disconnectButton = screen.getByText('Отключить')
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(mockWallet.disconnectWallet).toHaveBeenCalledTimes(1)
      })
    })

    it('should show error message when disconnection fails', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' }
      }

      mockWallet.disconnectWallet.mockRejectedValue(new Error('Disconnection failed'))

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      const disconnectButton = screen.getByText('Отключить')
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(screen.getByText('Disconnection error')).toBeInTheDocument()
      })
    })
  })

  describe('Balance Loading', () => {
    it('should load balance when wallet is connected', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      await waitFor(() => {
        expect(mockWallet.getBalance).toHaveBeenCalledTimes(1)
        expect(mockWallet.getTokenBalance).toHaveBeenCalledWith('NDT_MINT_ADDRESS')
      })
    })

    it('should handle balance loading error gracefully', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' }
      }

      mockWallet.getBalance.mockRejectedValue(new Error('Balance fetch failed'))

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load balance')).toBeInTheDocument()
      })
    })
  })

  describe('Copy to Clipboard', () => {
    it('should copy wallet address to clipboard when copy button is clicked', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' }
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      })

      render(<WalletConnect />)
      
      const copyButton = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          '1111111111111111111111111111111111111111111'
        )
      })
    })

    it('should handle clipboard copy error gracefully', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' }
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      // Mock clipboard API with error
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Clipboard error'))
        }
      })

      render(<WalletConnect />)
      
      const copyButton = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(copyButton)
      
      // Should not throw error, just log it
      await waitFor(() => {
        expect(screen.getByText('1111...1111')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error messages when they occur', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        error: 'Test error message'
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      await waitFor(() => {
        expect(screen.getByText('Test error message')).toBeInTheDocument()
      })
    })

    it('should clear error when wallet reconnects', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        error: 'Test error message'
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      // Initially show error
      await waitFor(() => {
        expect(screen.getByText('Test error message')).toBeInTheDocument()
      })

      // Update to remove error
      mockUseSolanaWallet.mockReturnValue({
        ...connectedWallet,
        error: null
      } as any)

      // Re-render component
      render(<WalletConnect />)
      
      await waitFor(() => {
        expect(screen.queryByText('Test error message')).not.toBeInTheDocument()
      })
    })
  })

  describe('State Changes', () => {
    it('should handle wallet state changes correctly', async () => {
      const { rerender } = render(<WalletConnect />)
      
      // Initial state - disconnected
      expect(screen.getByText('Подключить кошелек')).toBeInTheDocument()
      
      // Change to connected
      mockUseSolanaWallet.mockReturnValue({
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5
      } as any)

      rerender(<WalletConnect />)
      
      await waitFor(() => {
        expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
        expect(screen.getByText('1111...1111')).toBeInTheDocument()
      })
      
      // Change back to disconnected
      mockUseSolanaWallet.mockReturnValue(mockWallet)

      rerender(<WalletConnect />)
      
      await waitFor(() => {
        expect(screen.getByText('Подключить кошелек')).toBeInTheDocument()
      })
    })

    it('should update balance when it changes', async () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      await waitFor(() => {
        expect(screen.getByText('2.50 SOL')).toBeInTheDocument()
      })

      // Update balance
      mockUseSolanaWallet.mockReturnValue({
        ...connectedWallet,
        balance: 3.75
      } as any)

      rerender(<WalletConnect />)
      
      await waitFor(() => {
        expect(screen.getByText('3.75 SOL')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null publicKey gracefully', () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: null,
        balance: 2.5
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      // Should not crash, should show appropriate UI
      expect(screen.getByText('Кошелек подключен')).toBeInTheDocument()
    })

    it('should handle negative balance values', () => {
      const connectedWallet = {
        ...mockWallet,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: -1.5
      }

      mockUseSolanaWallet.mockReturnValue(connectedWallet as any)

      render(<WalletConnect />)
      
      // Should display negative balance
      expect(screen.getByText('-1.50 SOL')).toBeInTheDocument()
    })
  })
})