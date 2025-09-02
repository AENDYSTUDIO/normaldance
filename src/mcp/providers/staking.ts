export interface StakingPosition {
  id: string;
  userId: string;
  amount: number;
  type: 'fixed' | 'flexible' | 'liquidity' | 'nft' | 'tier';
  apy: number;
  startDate: Date;
  endDate?: Date;
  rewards: number;
}

export interface StakingPool {
  id: string;
  name: string;
  type: string;
  totalStaked: number;
  apy: number;
  minStake: number;
  lockPeriod?: number;
}

export class StakingContextProvider {
  async getPosition(positionId: string): Promise<StakingPosition | null> {
    // Mock implementation
    return {
      id: positionId,
      userId: 'user123',
      amount: 1000,
      type: 'fixed',
      apy: 12.5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rewards: 125.5
    };
  }

  async getUserPositions(userId: string): Promise<StakingPosition[]> {
    return [
      {
        id: 'pos1',
        userId,
        amount: 500,
        type: 'flexible',
        apy: 8.2,
        startDate: new Date(),
        rewards: 45.2
      }
    ];
  }

  async getStakingPools(): Promise<StakingPool[]> {
    return [
      {
        id: 'pool1',
        name: 'NDT Fixed Staking',
        type: 'fixed',
        totalStaked: 1000000,
        apy: 12.5,
        minStake: 100,
        lockPeriod: 365
      },
      {
        id: 'pool2',
        name: 'NDT Flexible Staking',
        type: 'flexible',
        totalStaked: 750000,
        apy: 8.2,
        minStake: 10
      }
    ];
  }

  async calculateRewards(amount: number, apy: number, days: number): Promise<number> {
    return (amount * apy / 100 / 365) * days;
  }

  async getPoolStats(poolId: string): Promise<any> {
    return {
      totalStaked: 1000000,
      totalStakers: 2500,
      averageStake: 400,
      volume24h: 50000,
      apy: 12.5
    };
  }
}