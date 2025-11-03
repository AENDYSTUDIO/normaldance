use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

/// Define the structure of the deflationary model data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct DeflationaryModel {
    /// Total supply of tokens
    pub total_supply: u64,
    /// Total burned tokens
    pub total_burned: u64,
    /// Treasury balance
    pub treasury_balance: u64,
    /// Staking rewards pool
    pub staking_rewards: u64,
    /// Burn percentage (basis points)
    pub burn_percentage: u16, // 200 basis points = 2%
    /// Treasury percentage (basis points)
    pub treasury_percentage: u16, // 60 basis points = 0.6%
    /// Staking rewards percentage (basis points)
    pub staking_percentage: u16, // 40 basis points = 0.4%
}

impl DeflationaryModel {
    /// Create a new deflationary model
    pub fn new(
        total_supply: u64,
        burn_percentage: u16,
        treasury_percentage: u16,
        staking_percentage: u16,
    ) -> Self {
        Self {
            total_supply,
            total_burned: 0,
            treasury_balance: 0,
            staking_rewards: 0,
            burn_percentage,
            treasury_percentage,
            staking_percentage,
        }
    }

    /// Calculate distribution amounts for a transaction
    pub fn calculate_distribution(&self, amount: u64) -> (u64, u64, u64, u64) {
        let burn = (amount * self.burn_percentage as u64) / 10000;
        let treasury = (amount * self.treasury_percentage as u64) / 10000;
        let staking = (amount * self.staking_percentage as u64) / 10000;
        let net = amount - burn - treasury - staking;
        
        (burn, treasury, staking, net)
    }

    /// Process a transaction with deflationary mechanics
    pub fn process_transaction(&mut self, amount: u64) -> Result<(u64, u64, u64, u64), ProgramError> {
        if amount == 0 {
            return Err(ProgramError::InvalidInstructionData);
        }

        let (burn, treasury, staking, net) = self.calculate_distribution(amount);
        
        // Update state
        self.total_burned = self.total_burned.checked_add(burn)
            .ok_or(ProgramError::AccountDataTooSmall)?;
        self.treasury_balance = self.treasury_balance.checked_add(treasury)
            .ok_or(ProgramError::AccountDataTooSmall)?;
        self.staking_rewards = self.staking_rewards.checked_add(staking)
            .ok_or(ProgramError::AccountDataTooSmall)?;
        
        Ok((burn, treasury, staking, net))
    }

    /// Distribute rewards to stakers
    pub fn distribute_staking_rewards(&mut self, amount: u64) -> Result<(), ProgramError> {
        if amount > self.staking_rewards {
            return Err(ProgramError::InsufficientFunds);
        }
        
        self.staking_rewards = self.staking_rewards.checked_sub(amount)
            .ok_or(ProgramError::AccountDataTooSmall)?;
        Ok(())
    }

    /// Distribute funds to treasury
    pub fn distribute_to_treasury(&mut self, amount: u64) -> Result<(), ProgramError> {
        if amount > self.treasury_balance {
            return Err(ProgramError::InsufficientFunds);
        }
        
        self.treasury_balance = self.treasury_balance.checked_sub(amount)
            .ok_or(ProgramError::AccountDataTooSmall)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deflationary_model_creation() {
        let model = DeflationaryModel::new(1000000000, 200, 60, 40);
        assert_eq!(model.total_supply, 1000000000);
        assert_eq!(model.total_burned, 0);
        assert_eq!(model.treasury_balance, 0);
        assert_eq!(model.staking_rewards, 0);
        assert_eq!(model.burn_percentage, 200);
        assert_eq!(model.treasury_percentage, 60);
        assert_eq!(model.staking_percentage, 40);
    }

    #[test]
    fn test_calculate_distribution() {
        let model = DeflationaryModel::new(1000000000, 200, 60, 40);
        let (burn, treasury, staking, net) = model.calculate_distribution(10000);
        
        assert_eq!(burn, 200); // 2% of 10000
        assert_eq!(treasury, 60); // 0.6% of 10000
        assert_eq!(staking, 40); // 0.4% of 10000
        assert_eq!(net, 9700); // 10000 - 200 - 60 - 40
    }

    #[test]
    fn test_process_transaction() {
        let mut model = DeflationaryModel::new(1000000000, 200, 60, 40);
        let result = model.process_transaction(10000);
        assert!(result.is_ok());
        
        let (burn, treasury, staking, net) = result.unwrap();
        assert_eq!(burn, 200);
        assert_eq!(treasury, 60);
        assert_eq!(staking, 40);
        assert_eq!(net, 9700);
        
        // Check state updates
        assert_eq!(model.total_burned, 200);
        assert_eq!(model.treasury_balance, 60);
        assert_eq!(model.staking_rewards, 40);
    }

    #[test]
    fn test_distribute_staking_rewards() {
        let mut model = DeflationaryModel::new(1000000000, 200, 60, 40);
        let _ = model.process_transaction(10000); // Add some rewards
        
        assert_eq!(model.staking_rewards, 40);
        let result = model.distribute_staking_rewards(20);
        assert!(result.is_ok());
        assert_eq!(model.staking_rewards, 20);
    }

    #[test]
    fn test_distribute_to_treasury() {
        let mut model = DeflationaryModel::new(1000000000, 200, 60, 40);
        let _ = model.process_transaction(10000); // Add to treasury
        
        assert_eq!(model.treasury_balance, 60);
        let result = model.distribute_to_treasury(30);
        assert!(result.is_ok());
        assert_eq!(model.treasury_balance, 30);
    }
}

pub mod entrypoint;
pub mod processor;
pub mod state;

// Export common types
pub use state::DeflationaryModel;
