
"use client";

import { useEvmWallet } from "@/hooks/useEvmWallet";
import { Button } from "@/components/ui/button"; // Assuming a generic Button component exists

export const EthereumConnectButton = () => {
  const { connect, isLoading, error } = useEvmWallet();

  return (
    <div>
      <Button onClick={connect} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Connect Ethereum Wallet"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
