import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ReactNode } from "react";

interface TonWalletProviderProps {
  children: ReactNode;
}

export function TonWalletProvider({ children }: TonWalletProviderProps) {
  // Manifest URL should point to your tonconnect-manifest.json
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
