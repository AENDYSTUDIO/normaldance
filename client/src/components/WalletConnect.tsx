import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type WalletType = "solana" | "ton" | "ethereum";

interface WalletOption {
  type: WalletType;
  name: string;
  icon: string;
  description: string;
}

const walletOptions: WalletOption[] = [
  {
    type: "solana",
    name: "Phantom",
    icon: "🟣",
    description: "Connect with Phantom wallet for Solana",
  },
  {
    type: "ton",
    name: "TON Connect",
    icon: "💎",
    description: "Connect with TON wallet",
  },
  {
    type: "ethereum",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect with MetaMask for Ethereum",
  },
];

export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<WalletType | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null);

  const updateWalletMutation = trpc.profile.updateWallet.useMutation({
    onSuccess: () => {
      toast.success("Wallet connected successfully!");
      setConnecting(null);
    },
    onError: (error) => {
      toast.error(`Failed to connect: ${error.message}`);
      setConnecting(null);
    },
  });

  const connectSolana = async () => {
    try {
      setConnecting("solana");
      
      // Check if Phantom is installed
      const { solana } = window as any;
      if (!solana?.isPhantom) {
        toast.error("Please install Phantom wallet");
        window.open("https://phantom.app/", "_blank");
        setConnecting(null);
        return;
      }

      // Connect to Phantom
      const response = await solana.connect();
      const address = response.publicKey.toString();

      // Update user profile
      await updateWalletMutation.mutateAsync({
        solanaAddress: address,
        preferredWallet: "solana",
      });

      setConnectedWallet("solana");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to connect Phantom");
      setConnecting(null);
    }
  };

  const connectTON = async () => {
    try {
      setConnecting("ton");
      
      // TON Connect integration would go here
      // For now, show a placeholder
      toast.info("TON Connect integration coming soon!");
      
      // Simulated connection for demo
      setTimeout(async () => {
        const demoAddress = "EQ" + Math.random().toString(36).substring(2, 15);
        await updateWalletMutation.mutateAsync({
          tonAddress: demoAddress,
          preferredWallet: "ton",
        });
        setConnectedWallet("ton");
        setOpen(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to connect TON");
      setConnecting(null);
    }
  };

  const connectEthereum = async () => {
    try {
      setConnecting("ethereum");
      
      // Check if MetaMask is installed
      const { ethereum } = window as any;
      if (!ethereum) {
        toast.error("Please install MetaMask");
        window.open("https://metamask.io/", "_blank");
        setConnecting(null);
        return;
      }

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      // Update user profile
      await updateWalletMutation.mutateAsync({
        ethereumAddress: address,
        preferredWallet: "ethereum",
      });

      setConnectedWallet("ethereum");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to connect MetaMask");
      setConnecting(null);
    }
  };

  const handleConnect = (type: WalletType) => {
    switch (type) {
      case "solana":
        connectSolana();
        break;
      case "ton":
        connectTON();
        break;
      case "ethereum":
        connectEthereum();
        break;
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 vinyl-glow"
        variant={connectedWallet ? "outline" : "default"}
      >
        <Wallet className="w-4 h-4" />
        {connectedWallet ? `Connected (${connectedWallet})` : "Connect Wallet"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect to Normal Dance platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.type}
                onClick={() => handleConnect(wallet.type)}
                disabled={connecting !== null}
                className="w-full p-4 glass rounded-lg hover:border-primary/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {wallet.name}
                      {connectedWallet === wallet.type && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wallet.description}
                    </div>
                  </div>
                  {connecting === wallet.type && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p>
              💡 <strong>New to crypto?</strong> Install a wallet extension to get started with Web3.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
