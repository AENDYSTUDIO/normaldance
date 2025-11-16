import { Button } from "@/components/ui/button";
import { Music, Heart, Plus } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function Memorials() {
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
                <a className="text-sm font-medium text-primary">G.Rave Memorials</a>
              </Link>
              <Link href="/player">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Player
                </a>
              </Link>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                G.Rave <span className="gradient-text">Memorials</span>
              </h1>
              <p className="text-muted-foreground">
                Honor legendary artists with eternal blockchain memorials
              </p>
            </div>
            <Button className="gap-2 vinyl-glow">
              <Plus className="w-4 h-4" />
              Create Memorial
            </Button>
          </div>

          {/* Memorial Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3D Vinyl Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Interactive 3D vinyl records with 27 candle tracks representing the artist's legacy
              </p>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Contracts</h3>
              <p className="text-sm text-muted-foreground">
                Ethereum/Polygon contracts ensure 98% of donations go to heirs, 2% to platform
              </p>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">IPFS Storage</h3>
              <p className="text-sm text-muted-foreground">
                All metadata encrypted and stored permanently on IPFS for eternal preservation
              </p>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="glass p-12 rounded-2xl text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-glow">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Memorial System Coming Soon</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're building a revolutionary way to honor legendary artists with blockchain-powered 
              memorials featuring 3D vinyl visualizations and smart contract donations
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
