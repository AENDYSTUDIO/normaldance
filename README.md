# 🎵 NORMAL DANCE - Web3 Music Platform Dashboard

A comprehensive Web3 music platform with full dashboard UI, blockchain integration, IPFS storage, and Telegram bot support.

## 🌟 Features

### ✅ Complete Dashboard (10 Sections)

1. **Лента (Feed)** - Personalized music recommendations and new releases
2. **Тренды (Trends)** - Trending tracks and genre statistics
3. **Обзор (Explore)** - Browse and discover new music by genre
4. **Библиотека (Library)** - User's playlists, liked tracks, and listening history
5. **Загрузить (Upload)** - Upload music to IPFS decentralized storage
6. **Кошелек (Wallet)** - Multi-chain Web3 wallet (Solana, Ethereum, TON)
7. **NFT Marketplace** - Buy, sell, and collect music NFTs
8. **Стейкинг (Staking)** - Stake $NDT tokens for passive income
9. **Статистика (Statistics)** - Analytics dashboard with charts and insights
10. **G.Rave Memorial** - Create eternal music memorials with 3D vinyl visualization
11. **Настройки (Settings)** - Profile, notifications, Telegram integration, security

### 🎨 Design Features

- **Dark Theme** - Professional dark UI with OKLCH color system
- **Violet Accent** - Beautiful violet gradient (#8B5CF6) throughout
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Smooth Animations** - Framer Motion powered transitions
- **Glass Morphism** - Modern glassmorphic effects
- **Custom Scrollbars** - Styled scrollbars matching the theme

### 🔗 Web3 Integration

- **Solana Wallet** - Support for Solana ecosystem
- **Ethereum/MetaMask** - EVM-compatible wallet integration
- **TON Connect 2.0** - Telegram's TON blockchain wallet
- **IPFS Storage** - Decentralized file storage for music
- **Smart Contracts** - Blockchain-based NFT and memorial systems

### 📱 Telegram Integration

- **Telegram Bot** - Full bot integration (@NormalDanceBot)
- **Mini App** - Telegram Mini App support
- **Telegram Stars** - Payment system integration
- **Push Notifications** - Real-time notifications via Telegram
- **TON Wallet** - Native TON Connect integration

### 💎 G.Rave Memorial System

Unique feature from the commercial IP repository:

- **3D Vinyl Visualization** - Interactive 3D vinyl record display
- **27 Memorial Candles** - Symbolic eternal memory representation
- **Blockchain Storage** - Ethereum/Polygon smart contracts
- **IPFS Metadata** - Encrypted metadata storage
- **Donation System** - 98% to heirs, 2% platform fee
- **Eternal Memory** - Permanent on-chain memorial

## 🗄️ Database Schema

Comprehensive schema with 9 tables:

- **users** - User profiles with Web3 wallet addresses and Telegram integration
- **tracks** - Music tracks with IPFS CIDs and metadata
- **playlists** - User playlists and collections
- **playlistTracks** - Junction table for playlist-track relationships
- **nfts** - NFT marketplace items with blockchain data
- **stakingPositions** - Token staking positions with APY calculations
- **graveMemorials** - G.Rave memorial system data
- **transactions** - Wallet transaction history
- **userActivity** - User activity tracking and analytics

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with OKLCH colors
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful charts and visualizations
- **shadcn/ui** - High-quality UI components
- **Wouter** - Lightweight routing

### Backend
- **Express 4** - Node.js server
- **tRPC 11** - End-to-end typesafe APIs
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Production database

### Web3 & Blockchain
- **Solana Web3.js** - Solana integration
- **Wagmi** - Ethereum wallet connections
- **Viem** - Ethereum interactions
- **TON Connect** - Telegram wallet integration
- **IPFS** - Decentralized storage (planned)

## 📁 Project Structure

```
normaldance-dashboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MusicDashboardLayout.tsx  # Main dashboard layout
│   │   │   └── ui/                        # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Feed.tsx                   # Feed section
│   │   │   ├── Trends.tsx                 # Trends section
│   │   │   ├── Explore.tsx                # Explore section
│   │   │   ├── Library.tsx                # Library section
│   │   │   ├── Upload.tsx                 # Upload section
│   │   │   ├── Wallet.tsx                 # Wallet section
│   │   │   ├── NFT.tsx                    # NFT marketplace
│   │   │   ├── Staking.tsx                # Staking section
│   │   │   ├── Statistics.tsx             # Analytics dashboard
│   │   │   ├── GRave.tsx                  # G.Rave memorial
│   │   │   └── Settings.tsx               # Settings section
│   │   ├── App.tsx                        # Routes configuration
│   │   └── index.css                      # Global styles & theme
│   └── public/                            # Static assets
├── server/
│   ├── db.ts                              # Database helpers
│   └── routers.ts                         # tRPC API routes
├── drizzle/
│   └── schema.ts                          # Database schema
└── shared/                                # Shared types & constants
```

## 🎯 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

The following environment variables are automatically configured:

- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Application logo

## 🎨 Color Palette

```css
/* Primary Violet */
--primary: oklch(0.65 0.25 285);  /* #8B5CF6 */

/* Background */
--background: oklch(0.12 0.01 264);  /* #0a0a0a */

/* Card */
--card: oklch(0.16 0.01 264);  /* Slightly lighter */

/* Border */
--border: oklch(0.30 0.02 264);  /* Zinc-800 equivalent */

/* Muted Text */
--muted-foreground: oklch(0.60 0.01 264);  /* Zinc-400 */
```

## 📊 Key Features Implementation

### Dashboard Layout
- Fixed sidebar navigation with all 10 sections
- Sticky top bar with balance display
- User profile with level badge (BRONZE/SILVER/GOLD/PLATINUM)
- Mobile-responsive hamburger menu

### Animations
- Framer Motion for page transitions
- Stagger animations for lists
- Hover effects on cards and buttons
- Smooth color transitions

### Charts & Analytics
- Line charts for listening activity
- Pie charts for genre distribution
- Bar charts for top tracks
- Activity calendar heatmap

### Web3 Features
- Wallet connection UI for multiple chains
- Transaction history display
- NFT marketplace with rarity badges
- Staking calculator with APY predictions

## ✅ Implemented Integrations

- ✅ **Solana Wallet** - Phantom, Solflare, Torus adapters
- ✅ **Ethereum Wallet** - MetaMask, WalletConnect via wagmi
- ✅ **TON Connect** - Telegram wallet integration
- ✅ **IPFS Upload** - Real file upload with progress tracking
- ✅ **IPFS Metadata** - JSON metadata storage

## 🔮 Future Enhancements

- [ ] Telegram Bot webhook endpoints
- [ ] Smart contract deployment for NFTs and G.Rave
- [ ] Real-time music player component with audio controls
- [ ] AI-powered music recommendations
- [ ] Social features (follow, comments, shares)
- [ ] Blockchain transaction history
- [ ] NFT minting interface

## 📝 Notes

- All sections are fully implemented with UI
- Mock data is used for demonstration
- Database schema is production-ready
- Web3 integration requires additional setup
- Telegram bot needs BotFather configuration

## 🔗 Related Repositories

This dashboard integrates with:
- **NormalDance (70%)** - Public repository with core features
- **normaldance-ip (30%)** - Private repository with commercial IP (G.Rave, Telegram Mini App, AI recommendations)

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Web3 music community**
