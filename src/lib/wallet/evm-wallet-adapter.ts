
import { createWalletClient, custom, http, WalletClient, PublicClient, createPublicClient } from "viem";
import { mainnet, polygon, bsc } from "viem/chains";
import { AppError } from "@/lib/errors/AppError";

// Custom Error for EVM Wallet operations
export class EvmWalletError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 400, "EVM_WALLET_ERROR", {
      originalError: originalError?.message,
    });
    this.name = "EvmWalletError";
  }
}

// --- Client Creation ---
let walletClient: WalletClient | null = null;
let publicClient: PublicClient | null = null;

/**
 * Creates and returns a Viem Wallet Client.
 * It ensures that it runs only in a browser environment.
 * @returns {WalletClient} The Viem Wallet Client.
 */
export function getWalletClient(): WalletClient {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new EvmWalletError("Ethereum provider (e.g., MetaMask) not found. Please install a wallet.");
  }

  if (walletClient) {
    return walletClient;
  }

  walletClient = createWalletClient({
    chain: mainnet, // Default to mainnet, can be made dynamic
    transport: custom(window.ethereum),
  });

  return walletClient;
}

/**
 * Creates and returns a Viem Public Client for reading blockchain data.
 * @returns {PublicClient} The Viem Public Client.
 */
export function getPublicClient(): PublicClient {
  if (publicClient) {
    return publicClient;
  }

  publicClient = createPublicClient({
    chain: mainnet, // Default to mainnet
    transport: http(), // Uses default JSON-RPC provider
  });

  return publicClient;
}

// --- Wallet Actions ---

/**
 * Connects to the user's Ethereum wallet and requests their address.
 * @returns {Promise<`0x${string}`>} The user's Ethereum address.
 */
export async function connectEvmWallet(): Promise<`0x${string}`> {
  try {
    const client = getWalletClient();
    const [address] = await client.requestAddresses();
    if (!address) {
      throw new EvmWalletError("Failed to get wallet address. Please ensure your wallet is unlocked and connected.");
    }
    return address;
  } catch (error) {
    throw new EvmWalletError("Failed to connect to wallet", error as Error);
  }
}

/**
 * Signs a message with the connected EVM wallet.
 * @param {string} message - The message to sign.
 * @returns {Promise<`0x${string}`>} The resulting signature.
 */
export async function signEvmMessage(message: string): Promise<`0x${string}`> {
  try {
    const client = getWalletClient();
    const address = await connectEvmWallet(); // Ensure we have an address

    const signature = await client.signMessage({
      account: address,
      message,
    });

    return signature;
  } catch (error) {
    throw new EvmWalletError("Failed to sign message", error as Error);
  }
}

/**
 * Gets the balance of the connected account.
 * @returns {Promise<bigint>} The balance in wei.
 */
export async function getEvmBalance(): Promise<bigint> {
  try {
    const client = getPublicClient();
    const address = await connectEvmWallet();
    const balance = await client.getBalance({ address });
    return balance;
  } catch (error) {
    throw new EvmWalletError("Failed to get balance", error as Error);
  }
}
