import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Wallet, Send, Sparkles, LogOut, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { WalletConnect } from "@/components/WalletConnect";
import { TelegramConnect } from "@/components/TelegramConnect";
import { AIRecommendations } from "@/components/AIRecommendations";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Music className="w-16 h-16 text-primary mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your dashboard
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <a className="flex items-center gap-2">
                <Music className="w-8 h-8 text-primary animate-glow" />
                <span className="text-xl font-bold gradient-text">{APP_TITLE}</span>
              </a>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/explore">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Explore
                </a>
              </Link>
              <Link href="/memorials">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  G.Rave Memorials
                </a>
              </Link>
              <Link href="/player">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Player
                </a>
              </Link>
              <Link href="/dashboard">
                <a className="text-sm font-medium text-primary">Dashboard</a>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">
                  <span className="text-sm">{user?.name || "User"}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{user?.name || "User"}</span>
            </h1>
            <p className="text-muted-foreground">
              Your personal Web3 music experience awaits
            </p>
          </div>

          {/* Upload Track CTA */}
          <div className="glass p-6 rounded-xl mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Share Your Music</h2>
              <p className="text-sm text-muted-foreground">
                Upload tracks to IPFS and reach a global audience
              </p>
            </div>
            <Button className="vinyl-glow" asChild>
              <Link href="/upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Track
              </Link>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Web3 Wallets</h3>
                  <p className="text-xs text-muted-foreground">Multi-chain support</p>
                </div>
              </div>
              <WalletConnect />
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Telegram</h3>
                  <p className="text-xs text-muted-foreground">Mini App & Stars</p>
                </div>
              </div>
              <TelegramConnect />
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-glow" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Discovery</h3>
                  <p className="text-xs text-muted-foreground">95%+ accuracy</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href="#recommendations">View Recommendations</a>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Tracks Played</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Playlists</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Memorials Visited</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Donations Made</div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div id="recommendations">
            <AIRecommendations />
          </div>
        </div>
      </main>
    </div>
  );
}
