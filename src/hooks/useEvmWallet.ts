
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
import { connectEvmWallet, signEvmMessage } from "@/lib/wallet/evm-wallet-adapter";
import { logger } from "@/lib/utils/logger";

export const useEvmWallet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Connect to wallet and get address
      const address = await connectEvmWallet();

      // 2. Create a SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = "Sign in with your Ethereum wallet to NORMALDANCE.";

      const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: "1",
        chainId: 1, // Mainnet, should be dynamic based on wallet connection
      });

      const messageToSign = message.prepareMessage();

      // 3. Sign the message
      const signature = await signEvmMessage(messageToSign);

      // 4. Sign in with NextAuth
      const result = await signIn("ethereum", {
        message: messageToSign,
        signature,
        redirect: false, // Handle redirect manually if needed
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Successfully signed in, session will be updated automatically
      logger.info("Successfully signed in with Ethereum wallet");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      logger.error("Failed to connect Ethereum wallet", new Error(errorMessage));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { connect, isLoading, error };
};
