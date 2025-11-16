import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Star, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function TelegramConnect() {
  const [open, setOpen] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [connecting, setConnecting] = useState(false);

  const updateTelegramMutation = trpc.profile.updateTelegram.useMutation({
    onSuccess: () => {
      toast.success("Telegram connected successfully!");
      setConnecting(false);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to connect: ${error.message}`);
      setConnecting(false);
    },
  });

  useEffect(() => {
    // Check if running inside Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      if (tg.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  const connectTelegram = async () => {
    try {
      setConnecting(true);

      // Check if Telegram WebApp is available
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) {
        toast.info("This feature works best in Telegram Mini App");
        setConnecting(false);
        return;
      }

      const user = tg.initDataUnsafe?.user;
      if (!user) {
        toast.error("Could not get Telegram user data");
        setConnecting(false);
        return;
      }

      // Update user profile with Telegram info
      await updateTelegramMutation.mutateAsync({
        telegramUserId: user.id.toString(),
        telegramUsername: user.username,
      });

      setTelegramUser(user);
    } catch (error: any) {
      toast.error(error.message || "Failed to connect Telegram");
      setConnecting(false);
    }
  };

  const openTelegramBot = () => {
    // Open Telegram bot for connection
    window.open("https://t.me/normaldance_bot", "_blank");
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={telegramUser ? "outline" : "default"}
        className="gap-2"
      >
        <Send className="w-4 h-4" />
        {telegramUser ? "Telegram Connected" : "Connect Telegram"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Telegram</DialogTitle>
            <DialogDescription>
              Access Normal Dance directly from Telegram and pay with Telegram Stars
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {telegramUser ? (
              <div className="glass p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  {telegramUser.photo_url && (
                    <img
                      src={telegramUser.photo_url}
                      alt={telegramUser.first_name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {telegramUser.first_name} {telegramUser.last_name}
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    {telegramUser.username && (
                      <div className="text-sm text-muted-foreground">
                        @{telegramUser.username}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  ✅ Your Telegram account is connected
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={connectTelegram}
                  disabled={connecting}
                  className="w-full p-4 glass rounded-lg hover:border-primary/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">📱</div>
                    <div className="flex-1">
                      <div className="font-semibold">Telegram Mini App</div>
                      <div className="text-sm text-muted-foreground">
                        Connect if you're using Telegram app
                      </div>
                    </div>
                    {connecting && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </button>

                <button
                  onClick={openTelegramBot}
                  className="w-full p-4 glass rounded-lg hover:border-primary/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🤖</div>
                    <div className="flex-1">
                      <div className="font-semibold">Open Telegram Bot</div>
                      <div className="text-sm text-muted-foreground">
                        Start chatting with @normaldance_bot
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Telegram Stars Info */}
            <div className="glass p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h4 className="font-semibold">Telegram Stars Payment</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Pay with Telegram Stars (70% to platform, 30% to Telegram)</li>
                <li>• Support artists with crypto donations</li>
                <li>• Share music with viral inline buttons</li>
                <li>• Access exclusive Telegram-only features</li>
              </ul>
            </div>

            {/* Mini App Features */}
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p>
                💡 <strong>Telegram Mini App</strong> lets you browse music, create memorials, 
                and make donations without leaving Telegram.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
