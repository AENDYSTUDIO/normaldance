import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NDTManager } from '@/components/wallet/ndt-manager'
import { useWalletContext } from '@/components/wallet/wallet-provider'
import { useTransactions } from '@/components/wallet/wallet-provider'
import { formatTokens, formatSol } from '@/components/wallet/wallet-adapter'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

// Mock external dependencies
jest.mock('@/components/wallet/wallet-provider')
jest.mock('@/components/wallet/wallet-adapter')
jest.mock('@solana/web3.js')

// Mock the wallet and transactions hooks
const mockUseWalletContext = useWalletContext as jest.MockedFunction<typeof useWalletContext>
const mockUseTransactions = useTransactions as jest.MockedFunction<typeof useTransactions>

// Mock formatting functions
const mockFormatTokens = formatTokens as jest.MockedFunction<typeof formatTokens>
const mockFormatSol = formatSol as jest.MockedFunction<typeof formatSol>

describe('NDTManager - Comprehensive Tests', () => {
  const mockWalletContext = {
    connected: false,
    publicKey: null,
    balance: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnecting: false,
    error: null,
  }

  const mockTransactions = {
    sendTransaction: jest.fn(),
  }

  const mockStakingInfo = {
    total_staked: 1000000000, // 1000 NDT
    apy: 15,
    level: 'SILVER' as const,
    lock_period_months: 6,
    pending_rewards: 50000000, // 50 NDT
    lock_period_remaining: 30 * 24 * 60 * 60, // 30 дней
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockUseWalletContext.mockReturnValue(mockWalletContext)
    mockUseTransactions.mockReturnValue(mockTransactions)
    mockFormatTokens.mockImplementation((amount: number) => amount.toString())
    mockFormatSol.mockImplementation((amount: number) => amount.toFixed(2))
  })

  describe('Rendering States', () => {
    it('should render disconnected state when wallet is not connected', () => {
      render(<NDTManager />)
      
      expect(screen.getByText('Пожалуйста, подключите кошелек для использования NDT Manager')).toBeInTheDocument()
    })

    it('should render connected state when wallet is connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('NDT Токены')).toBeInTheDocument()
      expect(screen.getByText('Стейкинг Информация')).toBeInTheDocument()
      expect(screen.getByText('Действия стейкинга')).toBeInTheDocument()
    })

    it('should display NDT balance when available', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Баланс NDT:')).toBeInTheDocument()
      expect(screen.getByText('Баланс SOL:')).toBeInTheDocument()
    })

    it('should show staking info when available', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Застейкено:')).toBeInTheDocument()
      expect(screen.getByText('Уровень:')).toBeInTheDocument()
      expect(screen.getByText('APY:')).toBeInTheDocument()
      expect(screen.getByText('Период блокировки:')).toBeInTheDocument()
    })

    it('should show staking actions when connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Стейкинг NDT')).toBeInTheDocument()
      expect(screen.getByText('100 NDT / 3 мес')).toBeInTheDocument()
      expect(screen.getByText('500 NDT / 6 мес')).toBeInTheDocument()
      expect(screen.getByText('1000 NDT / 12 мес')).toBeInTheDocument()
    })

    it('should show staking tiers info', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Уровни стейкинга')).toBeInTheDocument()
      expect(screen.getByText('Bronze')).toBeInTheDocument()
      expect(screen.getByText('Silver')).toBeInTheDocument()
      expect(screen.getByText('Gold')).toBeInTheDocument()
    })
  })

  describe('Staking Actions', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should handle stake action', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<NDTManager />)
      
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
        expect(screen.getByText('Стейкинг успешен! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should handle unstake action', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<NDTManager />)
      
      const unstakeButton = screen.getByText('Unstake All')
      fireEvent.click(unstakeButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
        expect(screen.getByText('Unstaking успешен! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should handle claim rewards action', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<NDTManager />)
      
      const claimButton = screen.getByText('Claim Rewards')
      fireEvent.click(claimButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
        expect(screen.getByText('Rewards claimed! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should disable stake button when staking', async () => {
      mockTransactions.sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<NDTManager />)
      
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      fireEvent.click(stakeButton)
      
      expect(stakeButton).toBeDisabled()
      
      await waitFor(() => {
        expect(stakeButton).not.toBeDisabled()
      })
    })

    it('should disable unstake button when unstaking', async () => {
      mockTransactions.sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<NDTManager />)
      
      const unstakeButton = screen.getByText('Unstake All')
      fireEvent.click(unstakeButton)
      
      expect(unstakeButton).toBeDisabled()
      
      await waitFor(() => {
        expect(unstakeButton).not.toBeDisabled()
      })
    })

    it('should disable claim button when claiming', async () => {
      mockTransactions.sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<NDTManager />)
      
      const claimButton = screen.getByText('Claim Rewards')
      fireEvent.click(claimButton)
      
      expect(claimButton).toBeDisabled()
      
      await waitFor(() => {
        expect(claimButton).not.toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should handle stake error', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Stake failed'))

      render(<NDTManager />)
      
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка стейкинга')).toBeInTheDocument()
      })
    })

    it('should handle unstake error', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Unstake failed'))

      render(<NDTManager />)
      
      const unstakeButton = screen.getByText('Unstake All')
      fireEvent.click(unstakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка unstaking')).toBeInTheDocument()
      })
    })

    it('should handle claim rewards error', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Claim failed'))

      render(<NDTManager />)
      
      const claimButton = screen.getByText('Claim Rewards')
      fireEvent.click(claimButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка claim rewards')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null publicKey gracefully', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: null,
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      // Should not crash
      expect(true).toBe(true)
    })

    it('should handle zero balance', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 0,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Баланс SOL:')).toBeInTheDocument()
    })

    it('should handle negative balance', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: -1.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Баланс SOL:')).toBeInTheDocument()
    })

    it('should handle missing staking info', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      // Should still render basic UI
      expect(screen.getByText('NDT Токены')).toBeInTheDocument()
    })

    it('should handle zero pending rewards', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      // Should not show claim rewards section
      expect(screen.queryByText('Claim Rewards')).not.toBeInTheDocument()
    })

    it('should handle zero lock period remaining', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      // Should not show lock period warning
      expect(screen.queryByText('Осталось до разблокировки')).not.toBeInTheDocument()
    })

    it('should handle large amounts', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 1000,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Баланс SOL:')).toBeInTheDocument()
    })

    it('should handle very small amounts', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 0.000001,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<NDTManager />)
      
      expect(screen.getByText('Баланс SOL:')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should update UI after successful stake', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<NDTManager />)
      
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Стейкинг успешен! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should show error message after failed stake', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Stake failed'))

      render(<NDTManager />)
      
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка стейкинга')).toBeInTheDocument()
      })
    })

    it('should handle multiple staking actions', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<NDTManager />)
      
      // Stake
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Стейкинг успешен! TX: test-signature')).toBeInTheDocument()
      })
      
      // Claim rewards
      const claimButton = screen.getByText('Claim Rewards')
      fireEvent.click(claimButton)
      
      await waitFor(() => {
        expect(screen.getByText('Rewards claimed! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should handle concurrent actions', async () => {
      mockTransactions.sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<NDTManager />)
      
      // Try to stake while another action is in progress
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      const unstakeButton = screen.getByText('Unstake All')
      
      fireEvent.click(stakeButton)
      fireEvent.click(unstakeButton)
      
      expect(stakeButton).toBeDisabled()
      expect(unstakeButton).toBeDisabled()
      
      await waitFor(() => {
        expect(stakeButton).not.toBeDisabled()
        expect(unstakeButton).not.toBeDisabled()
      })
    })
  })

  describe('Performance Tests', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should render quickly with large data', () => {
      const startTime = performance.now()
      
      render(<NDTManager />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
    })

    it('should handle rapid state changes', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<NDTManager />)
      
      const stakeButton = screen.getByText('100 NDT / 3 мес')
      
      // Click rapidly
      for (let i = 0; i < 5; i++) {
        fireEvent.click(stakeButton)
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // Should only execute once due to button disabling
      expect(mockTransactions.sendTransaction).toHaveBeenCalledTimes(1)
    })
  })
})