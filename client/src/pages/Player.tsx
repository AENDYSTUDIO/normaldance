import { Button } from "@/components/ui/button";
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function Player() {
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
                <a className="text-sm font-medium text-primary">Player</a>
              </Link>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Music <span className="gradient-text">Player</span>
            </h1>
            <p className="text-muted-foreground">
              Experience high-quality streaming from IPFS
            </p>
          </div>

          {/* Player Interface */}
          <div className="glass p-8 rounded-2xl">
            {/* Album Art */}
            <div className="aspect-square max-w-md mx-auto mb-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center vinyl-glow">
              <Music className="w-32 h-32 text-primary/50 animate-spin-slow" />
            </div>

            {/* Track Info */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">No Track Playing</h2>
              <p className="text-muted-foreground">Select a track to start listening</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-0 bg-primary rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0:00</span>
                <span>0:00</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <SkipBack className="w-6 h-6" />
              </Button>
              <Button size="icon" className="w-14 h-14 vinyl-glow">
                <Play className="w-7 h-7" />
              </Button>
              <Button variant="ghost" size="icon">
                <SkipForward className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Repeat className="w-5 h-5" />
              </Button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-primary rounded-full" />
              </div>
            </div>
          </div>

          {/* Queue/Playlist */}
          <div className="mt-8 glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Up Next</h3>
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tracks in queue</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/explore">Browse Music Catalog</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
