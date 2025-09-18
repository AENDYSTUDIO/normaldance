# Project Coding Rules (Non-Obvious Only)

- **Global Prisma instance**: Use global instance from `src/lib/db.ts`, never create new instances
- **Fixed Solana program IDs**: NDT_PROGRAM_ID, TRACKNFT_PROGRAM_ID, STAKING_PROGRAM_ID hardcoded in `wallet-adapter.tsx` - never change
- **DeflationaryModel**: All token transactions must use `DeflationaryModel` class for automatic 2% burn calculation
- **Custom wallet adapter**: Use custom event emitter system in `wallet-adapter.tsx`, not standard wallet-adapter-react patterns
- **Silent failures**: Wallet operations return 0 on error instead of throwing (silent failures)
- **Russian locale**: All SOL/token formatting uses Russian locale conventions in `formatSol()`
- **Relaxed TypeScript**: Web3 code intentionally has relaxed types (`noImplicitAny: false`, `no-non-null-assertion: off`)