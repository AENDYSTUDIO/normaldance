import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, TrendingUp, Lock, Unlock, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const stakingPools = [
  { id: 1, period: "30 дней", apy: 8.5, minStake: 100, totalStaked: 125000 },
  { id: 2, period: "90 дней", apy: 12.5, minStake: 500, totalStaked: 450000 },
  { id: 3, period: "180 дней", apy: 18.0, minStake: 1000, totalStaked: 780000 },
  { id: 4, period: "365 дней", apy: 25.0, minStake: 5000, totalStaked: 1200000 },
];

const myStakes = [
  { id: 1, amount: 1000, period: "90 дней", apy: 12.5, startDate: "2024-01-01", endDate: "2024-04-01", rewards: 31.25 },
];

export default function Staking() {
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState<number | null>(null);

  const handleStake = () => {
    if (!stakeAmount || !selectedPool) {
      toast.error("Выберите пул и введите сумму");
      return;
    }
    toast.success(`Стейкинг ${stakeAmount} $NDT инициирован!`);
    setStakeAmount("");
    setSelectedPool(null);
  };

  const calculateRewards = (amount: number, apy: number, days: number) => {
    return ((amount * apy / 100) * (days / 365)).toFixed(2);
  };

  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-8 h-8 text-primary" />
            Стейкинг
          </h1>
          <p className="text-muted-foreground mt-1">
            Зарабатывайте пассивный доход на ваших токенах $NDT
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Всего застейкано", value: "0 $NDT", icon: Lock },
            { label: "Заработано наград", value: "0 $NDT", icon: TrendingUp },
            { label: "Активные позиции", value: myStakes.length.toString(), icon: Coins },
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

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-semibold mb-1">Как работает стейкинг?</p>
                  <p className="text-muted-foreground">
                    Заблокируйте ваши токены $NDT на определенный период и получайте пассивный доход.
                    Чем дольше период блокировки, тем выше годовая процентная ставка (APY).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Staking Pools */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Пулы стейкинга
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stakingPools.map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`bg-card border-border cursor-pointer transition-all ${
                    selectedPool === pool.id
                      ? "border-primary/50 ring-2 ring-primary/20"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedPool(pool.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{pool.period}</CardTitle>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{pool.apy}%</p>
                        <p className="text-xs text-muted-foreground">APY</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Минимальный стейк:</span>
                        <span className="text-foreground font-semibold">{pool.minStake} $NDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Всего застейкано:</span>
                        <span className="text-foreground font-semibold">
                          {pool.totalStaked.toLocaleString()} $NDT
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stake Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Застейкать токены</CardTitle>
            <CardDescription>
              Выберите пул и введите количество токенов для стейкинга
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount" className="text-foreground">
                Количество $NDT
              </Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="0.00"
                className="bg-secondary border-border text-foreground"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Доступно: 0.00 $NDT
              </p>
            </div>

            {selectedPool && stakeAmount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-secondary/30 space-y-2"
              >
                <h4 className="font-semibold text-foreground">Предполагаемые награды</h4>
                <div className="space-y-1 text-sm">
                  {stakingPools
                    .filter((p) => p.id === selectedPool)
                    .map((pool) => {
                      const days = parseInt(pool.period);
                      const rewards = calculateRewards(parseFloat(stakeAmount), pool.apy, days);
                      return (
                        <div key={pool.id}>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">APY:</span>
                            <span className="text-primary font-semibold">{pool.apy}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Награды за период:</span>
                            <span className="text-foreground font-semibold">{rewards} $NDT</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Итого к получению:</span>
                            <span className="text-primary font-bold">
                              {(parseFloat(stakeAmount) + parseFloat(rewards)).toFixed(2)} $NDT
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            <Button
              className="w-full gradient-violet"
              size="lg"
              onClick={handleStake}
              disabled={!selectedPool || !stakeAmount}
            >
              <Lock className="w-4 h-4 mr-2" />
              Застейкать токены
            </Button>
          </CardContent>
        </Card>

        {/* My Stakes */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Мои позиции</CardTitle>
            <CardDescription>Активные стейкинг позиции</CardDescription>
          </CardHeader>
          <CardContent>
            {myStakes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Нет активных позиций</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myStakes.map((stake) => (
                  <div
                    key={stake.id}
                    className="p-4 rounded-lg bg-secondary/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{stake.amount} $NDT</p>
                        <p className="text-sm text-muted-foreground">{stake.period} • {stake.apy}% APY</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Unlock className="w-4 h-4 mr-2" />
                        Вывести
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Начало:</p>
                        <p className="text-foreground font-medium">{stake.startDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Окончание:</p>
                        <p className="text-foreground font-medium">{stake.endDate}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Накопленные награды:</span>
                        <span className="text-primary font-bold">{stake.rewards} $NDT</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MusicDashboardLayout>
  );
}
