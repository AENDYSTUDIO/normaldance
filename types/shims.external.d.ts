// Shims for external SDKs to avoid breaking runtime code

declare module 'next-auth' {
  export const unstable_noStore: any
  export const NextAuth: any
}

declare module '@next-auth/prisma-adapter' {
  export const PrismaAdapter: any
}

declare module '@solana/web3.js' {
  export const PublicKey: any
  export const SystemProgram: any
  export const Transaction: any
  export const Connection: any
}

declare module '@solana/wallet-adapter-react' {
  export const ConnectionProvider: any
  export const WalletProvider: any
  export const useWallet: any
}

declare module '@solana/wallet-adapter-phantom' {
  export default function PhantomWalletAdapter(...args: any[]): any
}

declare module 'ipfs-http-client' {
  export function create(...args: any[]): any
}

declare module '@pinata/sdk' {
  export default class PinataClient { constructor(...args: any[]) }
}

declare module 'winston' {
  export const createLogger: any
  export const transports: any
  export const format: any
}


