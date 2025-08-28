use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use std::str::FromStr;

declare_id!("STAKING111111111111111111111111111111111111111");

#[program]
pub mod staking {
    use super::*;

    // Инициализация программы стейкинга
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        let authority = &ctx.accounts.authority;
        
        staking_pool.authority = authority.key();
        staking_pool.total_staked = 0;
        staking_pool.total_rewards_distributed = 0;
        
        // Устанавливаем уровни стейкинга
        staking_pool.bronze_threshold = 500_000_000; // 500 $NDT
        staking_pool.silver_threshold = 5_000_000_000; // 5,000 $NDT
        staking_pool.gold_threshold = 50_000_000_000; // 50,000 $NDT
        
        // Базовые APY для каждого уровня
        staking_pool.bronze_base_apy = 5; // 5%
        staking_pool.silver_base_apy = 10; // 10%
        staking_pool.gold_base_apy = 15; // 15%
        
        Ok(())
    }

    // Стейкинг токенов
    pub fn stake(
        ctx: Context<Stake>,
        amount: u64,
        lock_period_months: u8,
    ) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        let staker = &mut ctx.accounts.staker;
        staker.amount = staker.amount.checked_add(amount).unwrap();
        
        // Обновляем общий стейкинг
        staking_pool.total_staked = staking_pool.total_staked.checked_add(amount).unwrap();
        
        // Рассчитываем APY на основе уровня и срока
        let tier_multiplier = get_tier_multiplier(staker.total_staked);
        let time_multiplier = get_time_multiplier(lock_period_months);
        let base_apy = get_base_apy(staker.total_staked, staking_pool);
        
        let final_apy = base_apy
            .checked_mul(tier_multiplier)
            .unwrap()
            .checked_div(100)
            .unwrap()
            .checked_mul(time_multiplier)
            .unwrap()
            .checked_div(100)
            .unwrap();
        
        staker.apy = final_apy;
        staker.lock_period_months = lock_period_months;
        staker.stake_time = Clock::get()?.unix_timestamp;
        staker.last_claim_time = Clock::get()?.unix_timestamp;
        
        emit!(StakeEvent {
            staker: staker.key(),
            amount,
            lock_period_months,
            apy: final_apy,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Unstaking токенов
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        let staker = &mut ctx.accounts.staker;
        
        require!(staker.amount >= amount, ErrorCode::InsufficientStake);
        
        let current_time = Clock::get()?.unix_timestamp;
        let lock_period_seconds = staker.lock_period_months as i64 * 30 * 24 * 60 * 60;
        
        // Проверяем, истек ли период блокировки
        require!(
            current_time >= staker.stake_time + lock_period_seconds,
            ErrorCode::LockPeriodNotExpired
        );
        
        // Обновляем стейкинг
        staker.amount = staker.amount.checked_sub(amount).unwrap();
        staking_pool.total_staked = staking_pool.total_staked.checked_sub(amount).unwrap();
        
        emit!(UnstakeEvent {
            staker: staker.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Claim rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        let staker = &mut ctx.accounts.staker;
        let rewards_account = &mut ctx.accounts.rewards_account;
        
        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time.checked_sub(staker.last_claim_time).unwrap();
        
        // Рассчитываем накопленные rewards
        let rewards = staker.amount
            .checked_mul(staker.apy as u64)
            .unwrap()
            .checked_mul(time_elapsed)
            .unwrap()
            .checked_div(365 * 24 * 60 * 60) // Год в секундах
            .unwrap()
            .checked_div(100) // APY в процентах
            .unwrap();
        
        require!(rewards > 0, ErrorCode::NoRewardsToClaim);
        
        // Выпускаем rewards
        let seeds = &[b"staking".as_ref(), &[ctx.bumps.staking_pool]];
        let signer = &[&seeds[..]];
        
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: rewards_account.to_account_info(),
                    authority: staking_pool.to_account_info(),
                },
            ),
            signer,
            rewards,
        )?;
        
        // Обновляем счетчики
        staker.last_claim_time = current_time;
        staking_pool.total_rewards_distributed = staking_pool.total_rewards_distributed.checked_add(rewards).unwrap();
        
        emit!(ClaimRewardsEvent {
            staker: staker.key(),
            rewards,
            timestamp: current_time,
        });
        
        Ok(())
    }

    // Обновление уровня стейкинга
    pub fn update_staking_level(ctx: Context<UpdateStakingLevel>) -> Result<()> {
        let staker = &mut ctx.accounts.staker;
        let staking_pool = &ctx.accounts.staking_pool;
        
        let old_level = staker.level;
        let new_level = calculate_staking_level(staker.total_staked, staking_pool);
        
        if old_level != new_level {
            staker.level = new_level;
            
            emit!(StakingLevelUpdatedEvent {
                staker: staker.key(),
                old_level,
                new_level,
                timestamp: Clock::get()?.unix_timestamp,
            });
        }
        
        Ok(())
    }

    // Обновление APY для уровня
    pub fn update_tier_apy(
        ctx: Context<UpdateTierApy>,
        tier: StakingTier,
        new_apy: u8,
    ) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        let authority = &ctx.accounts.authority;
        
        require!(authority.key() == staking_pool.authority, ErrorCode::Unauthorized);
        
        match tier {
            StakingTier::Bronze => staking_pool.bronze_base_apy = new_apy,
            StakingTier::Silver => staking_pool.silver_base_apy = new_apy,
            StakingTier::Gold => staking_pool.gold_base_apy = new_apy,
        }
        
        emit!(TierApyUpdatedEvent {
            tier,
            new_apy,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Обновление порогов уровней
    pub fn update_tier_thresholds(
        ctx: Context<UpdateTierThresholds>,
        bronze_threshold: u64,
        silver_threshold: u64,
        gold_threshold: u64,
    ) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        let authority = &ctx.accounts.authority;
        
        require!(authority.key() == staking_pool.authority, ErrorCode::Unauthorized);
        
        staking_pool.bronze_threshold = bronze_threshold;
        staking_pool.silver_threshold = silver_threshold;
        staking_pool.gold_threshold = gold_threshold;
        
        emit!(TierThresholdsUpdatedEvent {
            bronze_threshold,
            silver_threshold,
            gold_threshold,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Получение информации о стейкинге
    pub fn get_staking_info(ctx: Context<GetStakingInfo>) -> Result<StakingInfo> {
        let staker = &ctx.accounts.staker;
        let current_time = Clock::get()?.unix_timestamp;
        
        let time_elapsed = current_time.checked_sub(staker.last_claim_time).unwrap();
        let pending_rewards = staker.amount
            .checked_mul(staker.apy as u64)
            .unwrap()
            .checked_mul(time_elapsed)
            .unwrap()
            .checked_div(365 * 24 * 60 * 60)
            .unwrap()
            .checked_div(100)
            .unwrap();
        
        let lock_period_remaining = if current_time < staker.stake_time + (staker.lock_period_months as i64 * 30 * 24 * 60 * 60) {
            staker.stake_time + (staker.lock_period_months as i64 * 30 * 24 * 60 * 60) - current_time
        } else {
            0
        };
        
        Ok(StakingInfo {
            total_staked: staker.amount,
            apy: staker.apy,
            level: staker.level,
            lock_period_months: staker.lock_period_months,
            pending_rewards,
            lock_period_remaining,
        })
    }
}

// Helper функции
fn get_tier_multiplier(total_staked: u64) -> u64 {
    if total_staked >= 50_000_000_000 { // Gold tier
        200 // 2x multiplier
    } else if total_staked >= 5_000_000_000 { // Silver tier
        150 // 1.5x multiplier
    } else if total_staked >= 500_000_000 { // Bronze tier
        120 // 1.2x multiplier
    } else {
        100 // 1x multiplier
    }
}

fn get_time_multiplier(lock_period_months: u8) -> u64 {
    if lock_period_months >= 12 { // 12+ месяцев
        200 // 2x multiplier
    } else if lock_period_months >= 6 { // 6+ месяцев
        150 // 1.5x multiplier
    } else if lock_period_months >= 3 { // 3+ месяца
        120 // 1.2x multiplier
    } else {
        100 // 1x multiplier
    }
}

fn get_base_apy(total_staked: u64, staking_pool: &Account<StakingPool>) -> u64 {
    if total_staked >= staking_pool.gold_threshold {
        staking_pool.gold_base_apy as u64
    } else if total_staked >= staking_pool.silver_threshold {
        staking_pool.silver_base_apy as u64
    } else if total_staked >= staking_pool.bronze_threshold {
        staking_pool.bronze_base_apy as u64
    } else {
        5 // Default APY
    }
}

fn calculate_staking_level(total_staked: u64, staking_pool: &Account<StakingPool>) -> StakingTier {
    if total_staked >= staking_pool.gold_threshold {
        StakingTier::Gold
    } else if total_staked >= staking_pool.silver_threshold {
        StakingTier::Silver
    } else if total_staked >= staking_pool.bronze_threshold {
        StakingTier::Bronze
    } else {
        StakingTier::Bronze
    }
}

// Accounts
#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub total_staked: u64,
    pub total_rewards_distributed: u64,
    
    // Tier thresholds
    pub bronze_threshold: u64,
    pub silver_threshold: u64,
    pub gold_threshold: u64,
    
    // Base APY for each tier
    pub bronze_base_apy: u8,
    pub silver_base_apy: u8,
    pub gold_base_apy: u8,
}

#[account]
pub struct Staker {
    pub staker: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
    pub apy: u64,
    pub level: StakingTier,
    pub lock_period_months: u8,
    pub stake_time: i64,
    pub last_claim_time: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum StakingTier {
    Bronze,
    Silver,
    Gold,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakingInfo {
    pub total_staked: u64,
    pub apy: u64,
    pub level: StakingTier,
    pub lock_period_months: u8,
    pub pending_rewards: u64,
    pub lock_period_remaining: i64,
}

// Events
#[event]
pub struct StakeEvent {
    pub staker: Pubkey,
    pub amount: u64,
    pub lock_period_months: u8,
    pub apy: u64,
    pub timestamp: i64,
}

#[event]
pub struct UnstakeEvent {
    pub staker: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimRewardsEvent {
    pub staker: Pubkey,
    pub rewards: u64,
    pub timestamp: i64,
}

#[event]
pub struct StakingLevelUpdatedEvent {
    pub staker: Pubkey,
    pub old_level: StakingTier,
    pub new_level: StakingTier,
    pub timestamp: i64,
}

#[event]
pub struct TierApyUpdatedEvent {
    pub tier: StakingTier,
    pub new_apy: u8,
    pub timestamp: i64,
}

#[event]
pub struct TierThresholdsUpdatedEvent {
    pub bronze_threshold: u64,
    pub silver_threshold: u64,
    pub gold_threshold: u64,
    pub timestamp: i64,
}

// Contexts
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, seeds = [b"staking"], bump)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut, seeds = [b"staking"], bump)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 1 + 1 + 8 + 8,
        seeds = [b"staker", authority.key().as_ref()],
        bump
    )]
    pub staker: Account<'info, Staker>,
    #[account(mut)]
    pub rewards_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut, seeds = [b"staking"], bump)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"staker", authority.key().as_ref()], bump)]
    pub staker: Account<'info, Staker>,
    #[account(mut)]
    pub rewards_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut, seeds = [b"staking"], bump)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"staker", authority.key().as_ref()], bump)]
    pub staker: Account<'info, Staker>,
    #[account(mut)]
    pub rewards_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateStakingLevel<'info> {
    #[account(mut, seeds = [b"staking"], bump)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"staker", authority.key().as_ref()], bump)]
    pub staker: Account<'info, Staker>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTierApy<'info> {
    #[account(mut, seeds = [b"staking"], bump)]
    pub staking_pool: Account<'info, StakingPool>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTierThresholds<'info> {
    #[account(mut, seeds = [b"staking"], bump)]
    pub staking_pool: Account<'info, StakingPool>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetStakingInfo<'info> {
    #[account(seeds = [b"staker", authority.key().as_ref()], bump)]
    pub staker: Account<'info, Staker>,
    pub authority: Signer<'info>,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Lock period has not expired")]
    LockPeriodNotExpired,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
}