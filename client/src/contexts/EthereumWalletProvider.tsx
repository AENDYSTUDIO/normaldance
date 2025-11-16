import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { ReactNode } from "react";

// Configure chains and transports
const config = createConfig({
  chains: [mainnet, polygon, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Replace with actual project ID
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

interface EthereumWalletProviderProps {
  children: ReactNode;
}

export function EthereumWalletProvider({
  children,
}: EthereumWalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
