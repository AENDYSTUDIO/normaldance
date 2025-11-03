use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    program_pack::{IsInitialized, Pack, Sealed},
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
    /// Is the model initialized
    pub is_initialized: bool,
}

impl Sealed for DeflationaryModel {}

impl IsInitialized for DeflationaryModel {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for DeflationaryModel {
    const LEN: usize = 41; // 8 + 8 + 8 + 8 + 2 + 2 + 2 + 1 + 4 (padding)

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap();
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, solana_program::program_error::ProgramError> {
        let unpacked = Self::try_from_slice(src).unwrap();
        Ok(unpacked)
    }
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
            is_initialized: true,
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
    pub fn process_transaction(&mut self, amount: u64) -> Result<(u64, u64, u64, u64), solana_program::program_error::ProgramError> {
        use solana_program::program_error::ProgramError;

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
    pub fn distribute_staking_rewards(&mut self, amount: u64) -> Result<(), solana_program::program_error::ProgramError> {
        use solana_program::program_error::ProgramError;

        if amount > self.staking_rewards {
            return Err(ProgramError::InsufficientFunds);
        }
        
        self.staking_rewards = self.staking_rewards.checked_sub(amount)
            .ok_or(ProgramError::AccountDataTooSmall)?;
        Ok(())
    }

    /// Distribute funds to treasury
    pub fn distribute_to_treasury(&mut self, amount: u64) -> Result<(), solana_program::program_error::ProgramError> {
        use solana_program::program_error::ProgramError;

        if amount > self.treasury_balance {
            return Err(ProgramError::InsufficientFunds);
        }
        
        self.treasury_balance = self.treasury_balance.checked_sub(amount)
            .ok_or(ProgramError::AccountDataTooSmall)?;
        Ok(())
    }
}