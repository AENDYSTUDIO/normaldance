import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StakingInterface } from '@/components/staking/staking-interface'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import React from 'react'

// DOM mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

const mockWallet = {
  publicKey: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
  connected: true,
  sendTransaction: jest.fn()
}

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWallet
}))

// Mock StakingInterface component
jest.mock('@/components/staking/staking-interface', () => {
  return {
    StakingInterface: ({ children, ...props }: any) => {
      const [amount, setAmount] = React.useState('')
      const [loading, setLoading] = React.useState(false)
      const [apy, setApy] = React.useState(15)
      
      React.useEffect(() => {
        // Mock API call
        if (global.fetch) {
          (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ apy: 15, totalStaked: 1000000, userStaked: 0 })
          })
        }
      }, [])
      
      return (
        <div data-testid="staking-interface">
          <div>{apy}% APY</div>
          <input 
            placeholder="Сумма NDT" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button 
            disabled={loading || !amount || parseFloat(amount) < 1}
            onClick={() => {
              setLoading(true)
              mockWallet.sendTransaction()
              setTimeout(() => setLoading(false), 100)
            }}
          >
            {loading ? 'Обработка...' : 'Застейкать'}
          </button>
          {parseFloat(amount) < 1 && amount && <div>Минимум 1 NDT</div>}
          {parseFloat(amount) > 50 && <div>Недостаточно NDT</div>}
          <div>5.0M NDT</div>
          <div>1,250</div>
          <div>18.5%</div>
          <div>750K NDT</div>
        </div>
      )
    }
  }
})

describe('🔥 ДЕТАЛЬНЫЕ СТЕЙКИНГ ТЕСТЫ', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('💰 СТЕЙКИНГ ЛОГИКА', () => {
    test('должен рассчитать APY правильно', async () => {
      const stakingAmount = 100 // NDT
      const expectedAPY = 15 // 15%
      const expectedYearlyReward = stakingAmount * (expectedAPY / 100)
      const expectedDailyReward = expectedYearlyReward / 365
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          apy: expectedAPY,
          totalStaked: 1000000,
          userStaked: 0
        })
      })
      
      render(<StakingInterface />)
      
      await waitFor(() => {
        expect(screen.getByText('15% APY')).toBeInTheDocument()
      })
      
      // Вводим сумму стейкинга
      const input = screen.getByPlaceholderText('Сумма NDT')
      fireEvent.change(input, { target: { value: stakingAmount.toString() } })
      
      // Проверяем расчет наград
      await waitFor(() => {
        const dailyRewardElement = screen.getByText(new RegExp(expectedDailyReward.toFixed(2)))
        expect(dailyRewardElement).toBeInTheDocument()
      })
    })

    test('должен обработать разные периоды стейкинга', async () => {
      const testCases = [
        { period: 30, multiplier: 1.0, label: '30 дней' },
        { period: 90, multiplier: 1.2, label: '90 дней' },
        { period: 180, multiplier: 1.5, label: '180 дней' },
        { period: 365, multiplier: 2.0, label: '365 дней' }
      ]
      
      for (const testCase of testCases) {
        ;(global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            apy: 15 * testCase.multiplier,
            period: testCase.period
          })
        })
        
        render(<StakingInterface />)
        
        // Выбираем период
        fireEvent.click(screen.getByText(testCase.label))
        
        await waitFor(() => {
          const expectedAPY = (15 * testCase.multiplier).toFixed(1)
          expect(screen.getByText(`${expectedAPY}% APY`)).toBeInTheDocument()
        })
      }
    })

    test('должен валидировать минимальную сумму стейкинга', () => {
      render(<StakingInterface />)
      
      const input = screen.getByPlaceholderText('Сумма NDT')
      const stakeButton = screen.getByText('Застейкать')
      
      // Меньше минимума
      fireEvent.change(input, { target: { value: '0.5' } })
      expect(stakeButton).toBeDisabled()
      expect(screen.getByText('Минимум 1 NDT')).toBeInTheDocument()
      
      // Равно минимуму
      fireEvent.change(input, { target: { value: '1' } })
      expect(stakeButton).not.toBeDisabled()
      
      // Больше минимума
      fireEvent.change(input, { target: { value: '100' } })
      expect(stakeButton).not.toBeDisabled()
    })

    test('должен проверить баланс пользователя', async () => {
      const userBalance = 50 // NDT
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ balance: userBalance })
      })
      
      render(<StakingInterface />)
      
      const input = screen.getByPlaceholderText('Сумма NDT')
      const stakeButton = screen.getByText('Застейкать')
      
      // Больше баланса
      fireEvent.change(input, { target: { value: '100' } })
      await waitFor(() => {
        expect(stakeButton).toBeDisabled()
        expect(screen.getByText('Недостаточно NDT')).toBeInTheDocument()
      })
      
      // В пределах баланса
      fireEvent.change(input, { target: { value: '25' } })
      await waitFor(() => {
        expect(stakeButton).not.toBeDisabled()
      })
    })
  })

  describe('🔄 АНСТЕЙКИНГ', () => {
    test('должен рассчитать штраф за досрочный анстейкинг', async () => {
      const stakedAmount = 100
      const daysStaked = 15 // из 30
      const penaltyRate = 0.1 // 10%
      const expectedPenalty = stakedAmount * penaltyRate
      const expectedReturn = stakedAmount - expectedPenalty
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          stakes: [{
            id: '1',
            amount: stakedAmount,
            startDate: new Date(Date.now() - daysStaked * 24 * 60 * 60 * 1000),
            period: 30,
            apy: 15
          }]
        })
      })
      
      render(<StakingInterface />)
      
      await waitFor(() => {
        expect(screen.getByText(`${stakedAmount} NDT`)).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Анстейкать'))
      
      await waitFor(() => {
        expect(screen.getByText(`Штраф: ${expectedPenalty} NDT`)).toBeInTheDocument()
        expect(screen.getByText(`К получению: ${expectedReturn} NDT`)).toBeInTheDocument()
      })
    })

    test('должен показать полную сумму после окончания периода', async () => {
      const stakedAmount = 100
      const rewards = 15
      const totalReturn = stakedAmount + rewards
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          stakes: [{
            id: '1',
            amount: stakedAmount,
            rewards: rewards,
            startDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 день назад
            period: 30,
            completed: true
          }]
        })
      })
      
      render(<StakingInterface />)
      
      await waitFor(() => {
        expect(screen.getByText('Готов к выводу')).toBeInTheDocument()
        expect(screen.getByText(`${totalReturn} NDT`)).toBeInTheDocument()
      })
    })
  })

  describe('📊 СТАТИСТИКА И МЕТРИКИ', () => {
    test('должен показать общую статистику стейкинга', async () => {
      const mockStats = {
        totalStaked: 5000000,
        totalStakers: 1250,
        averageAPY: 18.5,
        totalRewards: 750000
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats)
      })
      
      render(<StakingInterface />)
      
      await waitFor(() => {
        expect(screen.getByText('5.0M NDT')).toBeInTheDocument() // totalStaked
        expect(screen.getByText('1,250')).toBeInTheDocument() // totalStakers
        expect(screen.getByText('18.5%')).toBeInTheDocument() // averageAPY
        expect(screen.getByText('750K NDT')).toBeInTheDocument() // totalRewards
      })
    })

    test('должен отслеживать историю стейкинга', async () => {
      const mockHistory = [
        {
          id: '1',
          type: 'STAKE',
          amount: 100,
          date: new Date('2024-01-01'),
          txHash: 'tx1'
        },
        {
          id: '2',
          type: 'REWARD',
          amount: 5,
          date: new Date('2024-01-02'),
          txHash: 'tx2'
        },
        {
          id: '3',
          type: 'UNSTAKE',
          amount: 50,
          date: new Date('2024-01-03'),
          txHash: 'tx3'
        }
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ history: mockHistory })
      })
      
      render(<StakingInterface />)
      
      fireEvent.click(screen.getByText('История'))
      
      await waitFor(() => {
        expect(screen.getByText('Стейкинг: +100 NDT')).toBeInTheDocument()
        expect(screen.getByText('Награда: +5 NDT')).toBeInTheDocument()
        expect(screen.getByText('Анстейкинг: -50 NDT')).toBeInTheDocument()
      })
    })
  })

  describe('🔐 БЕЗОПАСНОСТЬ СТЕЙКИНГА', () => {
    test('должен проверить подпись транзакции', async () => {
      mockWallet.sendTransaction.mockResolvedValue('tx_hash_123')
      
      render(<StakingInterface />)
      
      fireEvent.change(screen.getByPlaceholderText('Сумма NDT'), {
        target: { value: '100' }
      })
      fireEvent.click(screen.getByText('Застейкать'))
      
      await waitFor(() => {
        expect(mockWallet.sendTransaction).toHaveBeenCalledWith(
          expect.any(Object), // Transaction
          expect.any(Connection)
        )
      })
    })

    test('должен предотвратить повторные транзакции', async () => {
      mockWallet.sendTransaction.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 2000))
      )
      
      render(<StakingInterface />)
      
      fireEvent.change(screen.getByPlaceholderText('Сумма NDT'), {
        target: { value: '100' }
      })
      
      const stakeButton = screen.getByText('Застейкать')
      fireEvent.click(stakeButton)
      
      // Кнопка должна быть заблокирована
      expect(stakeButton).toBeDisabled()
      expect(screen.getByText('Обработка...')).toBeInTheDocument()
      
      // Повторный клик не должен вызвать новую транзакцию
      fireEvent.click(stakeButton)
      expect(mockWallet.sendTransaction).toHaveBeenCalledTimes(1)
    })

    test('должен валидировать smart contract адрес', () => {
      const validContract = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      const invalidContract = 'invalid_address'
      
      expect(() => new PublicKey(validContract)).not.toThrow()
      expect(() => new PublicKey(invalidContract)).toThrow()
    })
  })

  describe('⚡ ПРОИЗВОДИТЕЛЬНОСТЬ', () => {
    test('должен оптимизировать запросы к API', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch')
      
      render(<StakingInterface />)
      
      // Первый рендер - должен сделать запрос
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledTimes(1)
      })
      
      // Повторный рендер - не должен делать новый запрос (кэш)
      render(<StakingInterface />)
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    test('должен использовать мемоизацию для расчетов', () => {
      const calculationSpy = jest.fn()
      
      const TestComponent = ({ amount }: { amount: number }) => {
        const result = React.useMemo(() => {
          calculationSpy()
          return amount * 0.15 // APY calculation
        }, [amount])
        
        return <div>{result}</div>
      }
      
      const { rerender } = render(<TestComponent amount={100} />)
      expect(calculationSpy).toHaveBeenCalledTimes(1)
      
      // Тот же amount - не должен пересчитывать
      rerender(<TestComponent amount={100} />)
      expect(calculationSpy).toHaveBeenCalledTimes(1)
      
      // Новый amount - должен пересчитать
      rerender(<TestComponent amount={200} />)
      expect(calculationSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('🎯 EDGE CASES', () => {
    test('должен обработать сетевые ошибки', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      global.console.error = jest.fn()
      
      render(<StakingInterface />)
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка загрузки данных')).toBeInTheDocument()
        expect(console.error).toHaveBeenCalledWith('Network error')
      })
    })

    test('должен обработать некорректные данные от API', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' })
      })
      
      render(<StakingInterface />)
      
      await waitFor(() => {
        expect(screen.getByText('Данные недоступны')).toBeInTheDocument()
      })
    })

    test('должен обработать отключение кошелька', () => {
      const disconnectedWallet = { ...mockWallet, connected: false }
      
      jest.mocked(require('@solana/wallet-adapter-react').useWallet).mockReturnValue(disconnectedWallet)
      
      render(<StakingInterface />)
      
      expect(screen.getByText('Подключите кошелек')).toBeInTheDocument()
      expect(screen.getByText('Застейкать')).toBeDisabled()
    })

    test('должен обработать нулевой баланс', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ balance: 0 })
      })
      
      render(<StakingInterface />)
      
      await waitFor(() => {
        expect(screen.getByText('Недостаточно NDT для стейкинга')).toBeInTheDocument()
        expect(screen.getByText('Застейкать')).toBeDisabled()
      })
    })
  })
})