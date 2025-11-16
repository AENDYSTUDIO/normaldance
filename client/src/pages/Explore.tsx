import { Button } from "@/components/ui/button";
import { Music, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function Explore() {
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
                <a className="text-sm font-medium text-primary">Explore</a>
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

            <Button variant="outline" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Explore <span className="gradient-text">Music</span>
            </h1>
            <p className="text-muted-foreground">
              Discover tracks from around the world powered by Web3
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tracks, artists, albums..."
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Coming Soon Message */}
          <div className="glass p-12 rounded-2xl text-center">
            <Music className="w-16 h-16 text-primary mx-auto mb-4 animate-glow" />
            <h2 className="text-2xl font-bold mb-2">Music Catalog Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We're building an amazing music discovery experience with AI recommendations
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
