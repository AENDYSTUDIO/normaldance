import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gem, Music, TrendingUp, ShoppingCart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const nftCollections = [
  { id: 1, name: "Neon Beats #001", price: 2.5, blockchain: "Ethereum", rarity: "Rare", image: "🎵" },
  { id: 2, name: "Cyber Sound #042", price: 1.8, blockchain: "Solana", rarity: "Epic", image: "🎧" },
  { id: 3, name: "Digital Rhythm #123", price: 3.2, blockchain: "Polygon", rarity: "Legendary", image: "🎼" },
  { id: 4, name: "Wave Form #007", price: 1.2, blockchain: "Ethereum", rarity: "Common", image: "🌊" },
  { id: 5, name: "Synth Master #056", price: 4.5, blockchain: "Solana", rarity: "Legendary", image: "🎹" },
  { id: 6, name: "Bass Drop #089", price: 2.0, blockchain: "Polygon", rarity: "Rare", image: "🔊" },
];

const myNFTs = [
  { id: 1, name: "Owned NFT #001", acquired: "2024-01-10", value: 3.5 },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Common": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "Rare": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Epic": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "Legendary": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export default function NFT() {
  const handleBuy = (nft: any) => {
    toast.success(`Покупка ${nft.name} инициирована!`);
  };

  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Gem className="w-8 h-8 text-primary" />
            NFT Маркетплейс
          </h1>
          <p className="text-muted-foreground mt-1">
            Покупайте и продавайте уникальные музыкальные NFT
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Всего NFT", value: "1,234", icon: Gem },
            { label: "Объем торгов", value: "45.2 ETH", icon: TrendingUp },
            { label: "Моя коллекция", value: myNFTs.length.toString(), icon: ShoppingCart },
            { label: "Просмотры", value: "12.5K", icon: Eye },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList>
            <TabsTrigger value="marketplace">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Маркетплейс
            </TabsTrigger>
            <TabsTrigger value="my-nfts">
              <Gem className="w-4 h-4 mr-2" />
              Моя коллекция ({myNFTs.length})
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftCollections.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border hover:border-primary/50 transition-all overflow-hidden group">
                    <CardContent className="p-0">
                      {/* NFT Image */}
                      <div className="aspect-square bg-gradient-violet flex items-center justify-center text-8xl relative overflow-hidden">
                        {nft.image}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      
                      {/* NFT Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{nft.name}</h3>
                            <p className="text-sm text-muted-foreground">{nft.blockchain}</p>
                          </div>
                          <Badge className={getRarityColor(nft.rarity)}>
                            {nft.rarity}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Цена</p>
                            <p className="text-lg font-bold text-foreground">{nft.price} ETH</p>
                          </div>
                          <Button
                            size="sm"
                            className="gradient-violet"
                            onClick={() => handleBuy(nft)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Купить
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* My NFTs Tab */}
          <TabsContent value="my-nfts" className="mt-6">
            {myNFTs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Нет NFT в коллекции
                </h3>
                <p className="text-muted-foreground mb-6">
                  Начните собирать уникальные музыкальные NFT
                </p>
                <Button className="gradient-violet">
                  Перейти в маркетплейс
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-violet rounded-lg flex items-center justify-center text-6xl mb-4">
                          🎵
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Приобретено: {nft.acquired}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Текущая стоимость</p>
                            <p className="text-lg font-bold text-primary">{nft.value} ETH</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Продать
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MusicDashboardLayout>
  );
}
