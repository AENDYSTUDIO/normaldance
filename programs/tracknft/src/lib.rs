use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use std::str::FromStr;

declare_id!("TRACKNFT111111111111111111111111111111111111111");

#[program]
pub mod tracknft {
    use super::*;

    // Инициализация TrackNFT программы
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let track_nft = &mut ctx.accounts.track_nft;
        let authority = &ctx.accounts.authority;
        
        track_nft.authority = authority.key();
        track_nft.royalty_percentage = 10; // 10% роялти по умолчанию
        track_nft.total_tracks = 0;
        
        Ok(())
    }

    // Создание музыкального NFT
    pub fn create_track(
        ctx: Context<CreateTrack>,
        track_name: String,
        artist_name: String,
        ipfs_hash: String,
        price: u64,
        royalty_percentage: u8,
    ) -> Result<()> {
        let track_nft = &mut ctx.accounts.track_nft;
        let track = &mut ctx.accounts.track;
        let artist = &ctx.accounts.artist;
        let authority = &ctx.accounts.authority;
        
        require!(royalty_percentage <= 50, ErrorCode::RoyaltyTooHigh);
        
        // Инициализируем NFT
        track.track_name = track_name;
        track.artist_name = artist_name;
        track.ipfs_hash = ipfs_hash;
        track.price = price;
        track.royalty_percentage = royalty_percentage;
        track.is_listed = true;
        track.play_count = 0;
        track.like_count = 0;
        track.total_royalties_paid = 0;
        track.creator = artist.key();
        track.mint_time = Clock::get()?.unix_timestamp;
        
        // Увеличиваем счетчик треков
        track_nft.total_tracks = track_nft.total_tracks.checked_add(1).unwrap();
        
        emit!(TrackCreatedEvent {
            track: track.key(),
            creator: artist.key(),
            track_name: track.track_name.clone(),
            price,
            royalty_percentage,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Покупка трека
    pub fn buy_track(ctx: Context<BuyTrack>, track_id: Pubkey) -> Result<()> {
        let track_nft = &mut ctx.accounts.track_nft;
        let track = &mut ctx.accounts.track;
        let buyer = &ctx.accounts.buyer;
        let artist = &ctx.accounts.artist;
        let creator_royalties = &mut ctx.accounts.creator_royalties;
        let platform_fees = &mut ctx.accounts.platform_fees;
        let authority = &ctx.accounts.authority;
        
        require!(track.is_listed, ErrorCode::TrackNotListed);
        require!(buyer.key() != track.creator, ErrorCode::CreatorCannotBuy);
        
        let track_price = track.price;
        let royalty_amount = track_price
            .checked_mul(track.royalty_percentage as u64)
            .unwrap()
            .checked_div(100)
            .unwrap();
        
        let platform_fee = track_price
            .checked_mul(5) // 5% платформе
            .unwrap()
            .checked_div(100)
            .unwrap();
        
        let artist_amount = track_price
            .checked_sub(royalty_amount)
            .unwrap()
            .checked_sub(platform_fee)
            .unwrap();
        
        // Переводим средства артисту
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: buyer.to_account_info(),
                    to: artist.to_account_info(),
                    authority: authority.to_account_info(),
                },
            ),
            artist_amount,
        )?;
        
        // Выплачиваем роялти создателю (если это не артист)
        if artist.key() != track.creator {
            anchor_spl::token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Transfer {
                        from: buyer.to_account_info(),
                        to: creator_royalties.to_account_info(),
                        authority: authority.to_account_info(),
                    },
                ),
                royalty_amount,
            )?;
            
            // Обновляем общие роялти
            track.total_royalties_paid = track.total_royalties_paid.checked_add(royalty_amount).unwrap();
        }
        
        // Выплачиваем платформе
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: buyer.to_account_info(),
                    to: platform_fees.to_account_info(),
                    authority: authority.to_account_info(),
                },
            ),
            platform_fee,
        )?;
        
        // Обновляем счетчик продаж
        track.play_count = track.play_count.checked_add(1).unwrap();
        
        emit!(TrackPurchasedEvent {
            track: track.key(),
            buyer: buyer.key(),
            artist: artist.key(),
            price: track_price,
            royalty_amount,
            platform_fee,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Воспроизведение трека (для сбора аналитики)
    pub fn play_track(ctx: Context<PlayTrack>, track_id: Pubkey) -> Result<()> {
        let track = &mut ctx.accounts.track;
        let listener = &ctx.accounts.listener;
        
        require!(track.is_listed, ErrorCode::TrackNotListed);
        
        // Обновляем счетчик воспроизведений
        track.play_count = track.play_count.checked_add(1).unwrap();
        
        emit!(TrackPlayedEvent {
            track: track.key(),
            listener: listener.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Лайк трека
    pub fn like_track(ctx: Context<LikeTrack>, track_id: Pubkey) -> Result<()> {
        let track = &mut ctx.accounts.track;
        let listener = &ctx.accounts.listener;
        
        require!(track.is_listed, ErrorCode::TrackNotListed);
        
        // Обновляем счетчик лайков
        track.like_count = track.like_count.checked_add(1).unwrap();
        
        emit!(TrackLikedEvent {
            track: track.key(),
            listener: listener.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Обновление цены трека
    pub fn update_price(ctx: Context<UpdatePrice>, new_price: u64) -> Result<()> {
        let track = &mut ctx.accounts.track;
        let authority = &ctx.accounts.authority;
        
        require!(authority.key() == track.creator, ErrorCode::Unauthorized);
        
        track.price = new_price;
        
        emit!(PriceUpdatedEvent {
            track: track.key(),
            new_price,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Обновление роялти
    pub fn update_royalty(ctx: Context<UpdateRoyalty>, new_royalty: u8) -> Result<()> {
        let track = &mut ctx.accounts.track;
        let track_nft = &mut ctx.accounts.track_nft;
        let authority = &ctx.accounts.authority;
        
        require!(authority.key() == track.creator, ErrorCode::Unauthorized);
        require!(new_royalty <= 50, ErrorCode::RoyaltyTooHigh);
        
        track.royalty_percentage = new_royalty;
        
        emit!(RoyaltyUpdatedEvent {
            track: track.key(),
            new_royalty,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Списание/снятие с продажи
    pub fn toggle_listing(ctx: Context<ToggleListing>) -> Result<()> {
        let track = &mut ctx.accounts.track;
        let authority = &ctx.accounts.authority;
        
        require!(authority.key() == track.creator, ErrorCode::Unauthorized);
        
        track.is_listed = !track.is_listed;
        
        emit!(ListingToggledEvent {
            track: track.key(),
            is_listed: track.is_listed,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Выплата роялти создателям
    pub fn pay_royalties(ctx: Context<PayRoyalties>) -> Result<()> {
        let track_nft = &mut ctx.accounts.track_nft;
        let royalty_pool = &mut ctx.accounts.royalty_pool;
        let authority = &ctx.accounts.authority;
        
        // Логика выплаты роялти из пула
        // Здесь можно реализовать сложную логику распределения роялти
        
        emit!(RoyaltiesPaidEvent {
            total_amount: royalty_pool.amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

// Accounts
#[account]
pub struct TrackNftState {
    pub authority: Pubkey,
    pub royalty_percentage: u8, // Default royalty percentage
    pub total_tracks: u64,
}

#[account]
pub struct Track {
    pub track_name: String,
    pub artist_name: String,
    pub ipfs_hash: String,
    pub price: u64,
    pub royalty_percentage: u8,
    pub is_listed: bool,
    pub play_count: u64,
    pub like_count: u64,
    pub total_royalties_paid: u64,
    pub creator: Pubkey,
    pub mint_time: i64,
}

#[account]
pub struct RoyaltyAccount {
    pub creator: Pubkey,
    pub total_earned: u64,
    pub last_claim_time: i64,
}

// Events
#[event]
pub struct TrackCreatedEvent {
    pub track: Pubkey,
    pub creator: Pubkey,
    pub track_name: String,
    pub price: u64,
    pub royalty_percentage: u8,
    pub timestamp: i64,
}

#[event]
pub struct TrackPurchasedEvent {
    pub track: Pubkey,
    pub buyer: Pubkey,
    pub artist: Pubkey,
    pub price: u64,
    pub royalty_amount: u64,
    pub platform_fee: u64,
    pub timestamp: i64,
}

#[event]
pub struct TrackPlayedEvent {
    pub track: Pubkey,
    pub listener: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TrackLikedEvent {
    pub track: Pubkey,
    pub listener: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PriceUpdatedEvent {
    pub track: Pubkey,
    pub new_price: u64,
    pub timestamp: i64,
}

#[event]
pub struct RoyaltyUpdatedEvent {
    pub track: Pubkey,
    pub new_royalty: u8,
    pub timestamp: i64,
}

#[event]
pub struct ListingToggledEvent {
    pub track: Pubkey,
    pub is_listed: bool,
    pub timestamp: i64,
}

#[event]
pub struct RoyaltiesPaidEvent {
    pub total_amount: u64,
    pub timestamp: i64,
}

// Contexts
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, seeds = [b"tracknft"], bump)]
    pub track_nft: Account<'info, TrackNftState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTrack<'info> {
    #[account(mut, seeds = [b"tracknft"], bump)]
    pub track_nft: Account<'info, TrackNftState>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 200 + 200 + 8 + 1 + 8 + 8 + 8 + 32 + 8,
        seeds = [b"track", artist.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub track: Account<'info, Track>,
    #[account(mut)]
    pub artist: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuyTrack<'info> {
    #[account(mut, seeds = [b"tracknft"], bump)]
    pub track_nft: Account<'info, TrackNftState>,
    #[account(mut)]
    pub track: Account<'info, Track>,
    #[account(mut)]
    pub artist: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_royalties: Account<'info, TokenAccount>,
    #[account(mut)]
    pub platform_fees: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PlayTrack<'info> {
    #[account(mut)]
    pub track: Account<'info, Track>,
    pub listener: Signer<'info>,
}

#[derive(Accounts)]
pub struct LikeTrack<'info> {
    #[account(mut)]
    pub track: Account<'info, Track>,
    pub listener: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
    #[account(mut)]
    pub track: Account<'info, Track>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateRoyalty<'info> {
    #[account(mut)]
    pub track: Account<'info, Track>,
    #[account(mut, seeds = [b"tracknft"], bump)]
    pub track_nft: Account<'info, TrackNftState>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ToggleListing<'info> {
    #[account(mut)]
    pub track: Account<'info, Track>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct PayRoyalties<'info> {
    #[account(mut, seeds = [b"tracknft"], bump)]
    pub track_nft: Account<'info, TrackNftState>,
    #[account(mut)]
    pub royalty_pool: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Track is not listed for sale")]
    TrackNotListed,
    #[msg("Creator cannot buy their own track")]
    CreatorCannotBuy,
    #[msg("Royalty percentage too high (max 50%)")]
    RoyaltyTooHigh,
}