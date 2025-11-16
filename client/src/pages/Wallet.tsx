import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, Send, ArrowDownToLine, ArrowUpFromLine, Coins, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";



const transactions = [
  { id: 1, type: "deposit", amount: 100, currency: "NDT", date: "2024-01-15", status: "completed" },
  { id: 2, type: "withdrawal", amount: 50, currency: "NDT", date: "2024-01-14", status: "completed" },
  { id: 3, type: "stake", amount: 200, currency: "NDT", date: "2024-01-13", status: "pending" },
];

export default function Wallet() {
  // Solana wallet
  const { publicKey: solanaPublicKey, connected: solanaConnected } = useWallet();
  
  // Ethereum wallet
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { connect: ethConnect, connectors } = useConnect();
  const { disconnect: ethDisconnect } = useDisconnect();
  
  // TON wallet
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const tonConnected = !!tonAddress;
  
  const handleEthConnect = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      ethConnect({ connector: injectedConnector });
    } else {
      toast.error("MetaMask не найден. Установите расширение MetaMask.");
    }
  };
  
  const handleTonConnect = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      toast.error("Ошибка подключения TON кошелька");
    }
  };

  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <WalletIcon className="w-8 h-8 text-primary" />
            Кошелек
          </h1>
          <p className="text-muted-foreground mt-1">
            Управляйте своими криптовалютными активами
          </p>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-violet border-0 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/80 text-sm mb-1">Общий баланс</p>
                  <h2 className="text-4xl font-bold">0.00 $NDT</h2>
                  <p className="text-white/60 text-sm mt-1">≈ $0.00 USD</p>
                </div>
                <Coins className="w-16 h-16 text-white/30" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Пополнить
                </Button>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  Вывести
                </Button>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Send className="w-4 h-4 mr-2" />
                  Отправить
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connect Wallets */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Подключить кошелек
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Solana Wallet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl mb-3 text-purple-400">◎</div>
                    <h3 className="font-semibold text-foreground mb-2">Solana</h3>
                    {solanaConnected ? (
                      <>
                        <div className="text-sm text-green-500 mb-2">✓ Подключено</div>
                        <p className="text-xs text-muted-foreground mb-3 font-mono truncate">
                          {solanaPublicKey?.toBase58().slice(0, 8)}...{solanaPublicKey?.toBase58().slice(-6)}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground mb-3">Не подключено</div>
                    )}
                    <WalletMultiButton className="!bg-violet-600 !hover:bg-violet-700 !text-white !rounded-md !px-4 !py-2 !text-sm !font-medium" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ethereum Wallet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl mb-3 text-blue-400">Ξ</div>
                    <h3 className="font-semibold text-foreground mb-2">Ethereum</h3>
                    {ethConnected ? (
                      <>
                        <div className="text-sm text-green-500 mb-2">✓ Подключено</div>
                        <p className="text-xs text-muted-foreground mb-3 font-mono truncate">
                          {ethAddress?.slice(0, 8)}...{ethAddress?.slice(-6)}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => ethDisconnect()}>
                          Отключить
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-3">Не подключено</div>
                        <Button size="sm" className="gradient-violet" onClick={handleEthConnect}>
                          Подключить
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* TON Wallet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl mb-3 text-cyan-400">💎</div>
                    <h3 className="font-semibold text-foreground mb-2">TON</h3>
                    {tonConnected ? (
                      <>
                        <div className="text-sm text-green-500 mb-2">✓ Подключено</div>
                        <p className="text-xs text-muted-foreground mb-3 font-mono truncate">
                          {tonAddress.slice(0, 8)}...{tonAddress.slice(-6)}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => tonConnectUI.disconnect()}>
                          Отключить
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-3">Не подключено</div>
                        <Button size="sm" className="gradient-violet" onClick={handleTonConnect}>
                          Подключить
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Transactions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">История транзакций</CardTitle>
            <CardDescription>Последние операции с вашим кошельком</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="deposit">Пополнения</TabsTrigger>
                <TabsTrigger value="withdrawal">Выводы</TabsTrigger>
                <TabsTrigger value="stake">Стейкинг</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                      <WalletIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Нет транзакций</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "deposit" ? "bg-green-500/20" :
                            tx.type === "withdrawal" ? "bg-red-500/20" :
                            "bg-blue-500/20"
                          }`}>
                            {tx.type === "deposit" ? (
                              <ArrowDownToLine className="w-5 h-5 text-green-500" />
                            ) : tx.type === "withdrawal" ? (
                              <ArrowUpFromLine className="w-5 h-5 text-red-500" />
                            ) : (
                              <Coins className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground capitalize">
                              {tx.type === "deposit" ? "Пополнение" :
                               tx.type === "withdrawal" ? "Вывод" :
                               "Стейкинг"}
                            </p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            tx.type === "deposit" ? "text-green-500" :
                            tx.type === "withdrawal" ? "text-red-500" :
                            "text-foreground"
                          }`}>
                            {tx.type === "deposit" ? "+" : "-"}{tx.amount} {tx.currency}
                          </p>
                          <p className={`text-xs ${
                            tx.status === "completed" ? "text-green-500" :
                            tx.status === "pending" ? "text-yellow-500" :
                            "text-red-500"
                          }`}>
                            {tx.status === "completed" ? "Завершено" :
                             tx.status === "pending" ? "В обработке" :
                             "Отменено"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MusicDashboardLayout>
  );
}
