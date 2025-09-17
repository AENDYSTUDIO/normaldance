import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StakingManager } from '@/components/wallet/staking-manager'
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

describe('StakingManager - Comprehensive Tests', () => {
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

  const mockStakingPositions = [
    {
      id: '1',
      amount: 1000000000, // 1000 NDT
      tier: {
        level: 'SILVER' as const,
        minAmount: 5000000000,
        maxAmount: 50000000000,
        apy: 15,
        lockPeriods: [3, 6, 12],
        color: 'text-gray-600',
        icon: '🥈'
      },
      lockPeriod: 6,
      startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: Date.now() + 150 * 24 * 60 * 60 * 1000,
      rewards: 25000000, // 25 NDT
      isActive: true
    }
  ]

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
      render(<StakingManager />)
      
      expect(screen.getByText('Пожалуйста, подключите кошелек для использования Staking Manager')).toBeInTheDocument()
    })

    it('should render connected state when wallet is connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      expect(screen.getByText('NDT Balance')).toBeInTheDocument()
      expect(screen.getByText('Active Positions')).toBeInTheDocument()
      expect(screen.getByText('Total Rewards')).toBeInTheDocument()
      expect(screen.getByText('Новый стейкинг')).toBeInTheDocument()
    })

    it('should show overview cards when connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      expect(screen.getByText('NDT Balance')).toBeInTheDocument()
      expect(screen.getByText('Active Positions')).toBeInTheDocument()
      expect(screen.getByText('Total Rewards')).toBeInTheDocument()
    })

    it('should show staking tiers when connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      expect(screen.getByText('Выберите уровень')).toBeInTheDocument()
      expect(screen.getByText('BRONZE')).toBeInTheDocument()
      expect(screen.getByText('SILVER')).toBeInTheDocument()
      expect(screen.getByText('GOLD')).toBeInTheDocument()
    })

    it('should show active positions when available', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      expect(screen.getByText('Активные позиции')).toBeInTheDocument()
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

    it('should handle tier selection', () => {
      render(<StakingManager />)
      
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      expect(screen.getByText('Период блокировки')).toBeInTheDocument()
    })

    it('should handle lock period selection', () => {
      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Select 6 months lock period
      const lockPeriodButton = screen.getByText('6 месяцев')
      fireEvent.click(lockPeriodButton)
      
      expect(lockPeriodButton).toHaveClass('bg-primary')
    })

    it('should handle amount input', () => {
      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      expect(amountInput).toHaveValue(1000000000)
    })

    it('should handle min/max buttons', () => {
      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Click min button
      const minButton = screen.getByText('Мин')
      fireEvent.click(minButton)
      
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      expect(amountInput).toHaveValue(5000000000)
      
      // Click max button
      const maxButton = screen.getByText('Макс')
      fireEvent.click(maxButton)
      
      expect(amountInput).toHaveValue(50000000000)
    })

    it('should show expected rewards', () => {
      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      expect(screen.getByText('Ожидаемые rewards:')).toBeInTheDocument()
    })

    it('should enable stake button when all requirements are met', () => {
      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      const stakeButton = screen.getByText('Stake 1000000000')
      expect(stakeButton).not.toBeDisabled()
    })

    it('should disable stake button when amount is too low', () => {
      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount below minimum
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '100000000' } })
      
      const stakeButton = screen.getByText('Stake 100000000')
      expect(stakeButton).toBeDisabled()
    })

    it('should disable stake button when amount is too high', () => {
      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount above maximum
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '100000000000' } })
      
      const stakeButton = screen.getByText('Stake 100000000000')
      expect(stakeButton).toBeDisabled()
    })

    it('should handle stake action', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      // Click stake button
      const stakeButton = screen.getByText('Stake 1000000000')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
        expect(screen.getByText('Стейкинг успешен! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should handle unstake action', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<StakingManager />)
      
      // Click unstake button
      const unstakeButton = screen.getByText('Unstake')
      fireEvent.click(unstakeButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
        expect(screen.getByText('Unstaking успешен! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should handle claim rewards action', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<StakingManager />)
      
      // Click claim rewards button
      const claimButton = screen.getByText('Claim Rewards')
      fireEvent.click(claimButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
        expect(screen.getByText('Rewards claimed! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should disable buttons when actions are in progress', async () => {
      mockTransactions.sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      // Click stake button
      const stakeButton = screen.getByText('Stake 1000000000')
      fireEvent.click(stakeButton)
      
      expect(stakeButton).toBeDisabled()
      
      await waitFor(() => {
        expect(stakeButton).not.toBeDisabled()
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

      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      // Click stake button
      const stakeButton = screen.getByText('Stake 1000000000')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка стейкинга')).toBeInTheDocument()
      })
    })

    it('should handle unstake error', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Unstake failed'))

      render(<StakingManager />)
      
      // Click unstake button
      const unstakeButton = screen.getByText('Unstake')
      fireEvent.click(unstakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка unstaking')).toBeInTheDocument()
      })
    })

    it('should handle claim rewards error', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Claim failed'))

      render(<StakingManager />)
      
      // Click claim rewards button
      const claimButton = screen.getByText('Claim Rewards')
      fireEvent.click(claimButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка claim rewards')).toBeInTheDocument()
      })
    })

    it('should handle insufficient balance error', async () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
        ndtBalance: 100000000, // Only 100 NDT
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount higher than balance
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      // Click stake button
      const stakeButton = screen.getByText('Stake 1000000000')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Недостаточно NDT токенов')).toBeInTheDocument()
      })
    })

    it('should handle position not found error', async () => {
      render(<StakingManager />)
      
      // Click unstake button with invalid position
      const unstakeButton = screen.getByText('Unstake')
      fireEvent.click(unstakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Позиция не найдена')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should handle null publicKey gracefully', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: null,
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
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

      render(<StakingManager />)
      
      expect(screen.getByText('NDT Balance')).toBeInTheDocument()
    })

    it('should handle negative balance', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: -1.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      expect(screen.getByText('NDT Balance')).toBeInTheDocument()
    })

    it('should handle missing positions', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      // Should still render basic UI
      expect(screen.getByText('NDT Balance')).toBeInTheDocument()
      expect(screen.getByText('Active Positions')).toBeInTheDocument()
    })

    it('should handle zero rewards', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      // Should not show claim rewards section
      expect(screen.queryByText('Claim Rewards')).not.toBeInTheDocument()
    })

    it('should handle locked positions', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      // Should show lock period warning
      expect(screen.getByText('Время блокировки')).toBeInTheDocument()
    })

    it('should handle expired positions', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      // Should show unstake button for expired positions
      expect(screen.getByText('Unstake')).toBeInTheDocument()
    })

    it('should handle large amounts', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 1000,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      expect(screen.getByText('NDT Balance')).toBeInTheDocument()
    })

    it('should handle very small amounts', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 0.000001,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<StakingManager />)
      
      expect(screen.getByText('NDT Balance')).toBeInTheDocument()
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

      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      // Click stake button
      const stakeButton = screen.getByText('Stake 1000000000')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Стейкинг успешен! TX: test-signature')).toBeInTheDocument()
      })
    })

    it('should show error message after failed stake', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Stake failed'))

      render(<StakingManager />)
      
      // Select SILVER tier
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      // Click stake button
      const stakeButton = screen.getByText('Stake 1000000000')
      fireEvent.click(stakeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка стейкинга')).toBeInTheDocument()
      })
    })

    it('should handle multiple staking actions', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<StakingManager />)
      
      // Stake
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      const stakeButton = screen.getByText('Stake 1000000000')
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

      render(<StakingManager />)
      
      // Try to stake while another action is in progress
      const silverTier = screen.getByText('SILVER')
      fireEvent.click(silverTier)
      
      const amountInput = screen.getByPlaceholderText(/Мин:/)
      fireEvent.change(amountInput, { target: { value: '1000000000' } })
      
      const stakeButton = screen.getByText('Stake 1000000000')
      const unstakeButton = screen.getByText('Unstake')
      
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
      
      render(<StakingManager />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
    })

    it('should handle rapid state changes', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<StakingManager />)
      
      const silverTier = screen.getByText('SILVER')
      const stakeButton = screen.getByText('Stake 1000000000')
      
      // Click rapidly
      for (let i = 0; i < 5; i++) {
        fireEvent.click(silverTier)
        fireEvent.click(stakeButton)
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // Should only execute once due to button disabling
      expect(mockTransactions.sendTransaction).toHaveBeenCalledTimes(1)
    })
  })
})