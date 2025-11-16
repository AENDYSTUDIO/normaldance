import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Wallet, Heart, Sparkles, Play, TrendingUp } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Music className="w-8 h-8 text-primary animate-glow" />
              <span className="text-xl font-bold gradient-text">{APP_TITLE}</span>
            </div>
            
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
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {user?.name || "User"}
                  </span>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.65_0.25_290_/_0.15),transparent_50%)]" />
          
          {/* Floating vinyl records */}
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          
          <div className="container relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/50 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Web3 Music Platform</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                <span className="gradient-text">Normal Dance</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Experience the future of music with blockchain integration, AI recommendations, 
                and eternal memorials for legendary artists.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="text-lg px-8 py-6 vinyl-glow" asChild>
                  <Link href="/explore">
                    <Play className="w-5 h-5 mr-2" />
                    Start Listening
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link href="/memorials">
                    <Heart className="w-5 h-5 mr-2" />
                    Explore Memorials
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Powered by <span className="gradient-text">Innovation</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Combining cutting-edge Web3 technology with AI-driven music discovery
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Web3 Integration */}
              <div className="glass p-8 rounded-2xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Multi-Chain Wallets</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with Solana, TON, or Ethereum wallets. Seamless integration 
                  with MetaMask, Phantom, and TON Connect 2.0.
                </p>
              </div>

              {/* Feature 2: G.Rave Memorials */}
              <div className="glass p-8 rounded-2xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">G.Rave Memorials</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Honor legendary artists with 3D vinyl memorials featuring 27 candle tracks. 
                  Smart contracts ensure 98% goes to heirs.
                </p>
              </div>

              {/* Feature 3: AI Recommendations */}
              <div className="glass p-8 rounded-2xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI Discovery</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Proprietary ML models analyze your taste with 95%+ accuracy. 
                  Real-time learning adapts to your evolving preferences.
                </p>
              </div>

              {/* Feature 4: Telegram Mini App */}
              <div className="glass p-8 rounded-2xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Music className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Telegram Integration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access the platform directly from Telegram. Pay with Telegram Stars 
                  and share music with viral inline buttons.
                </p>
              </div>

              {/* Feature 5: IPFS Storage */}
              <div className="glass p-8 rounded-2xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Decentralized Storage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All music and metadata stored on IPFS with encryption. 
                  True ownership and permanence for your collection.
                </p>
              </div>

              {/* Feature 6: Privacy First */}
              <div className="glass p-8 rounded-2xl hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Zero-Knowledge Privacy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ZK-proofs protect your listening habits. GDPR/CCPA compliant 
                  with anonymous analytics and encrypted user data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container">
            <div className="glass p-12 md:p-16 rounded-3xl text-center max-w-4xl mx-auto border-primary/30">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="gradient-text">Experience</span> the Future?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of music lovers discovering, sharing, and honoring 
                legendary artists on the blockchain.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Button size="lg" className="text-lg px-8 py-6 vinyl-glow" asChild>
                    <Link href="/explore">
                      <Music className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="text-lg px-8 py-6 vinyl-glow" asChild>
                    <a href={getLoginUrl()}>
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Music className="w-6 h-6 text-primary" />
                <span className="font-bold gradient-text">{APP_TITLE}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The future of decentralized music streaming and artist memorials.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore"><a className="hover:text-foreground transition-colors">Explore Music</a></Link></li>
                <li><Link href="/memorials"><a className="hover:text-foreground transition-colors">Memorials</a></Link></li>
                <li><Link href="/player"><a className="hover:text-foreground transition-colors">Player</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Solana Integration</li>
                <li>TON Blockchain</li>
                <li>Ethereum Support</li>
                <li>IPFS Storage</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Telegram Mini App</li>
                <li>AI Recommendations</li>
                <li>Privacy First</li>
                <li>Open Source (70%)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2024 {APP_TITLE}. Built with ❤️ by AENDYSTUDIO.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
