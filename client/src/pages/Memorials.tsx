import { Button } from "@/components/ui/button";
import { Music, Heart, Plus } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";
import { VinylMemorial } from "@/components/VinylMemorial";
import { MemorialCard } from "@/components/MemorialCard";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

function MemorialGallery() {
  const { data: memorials, isLoading } = trpc.memorials.list.useQuery({ limit: 20 });

  // Mock data for demo
  const mockMemorials = [
    {
      id: 1,
      artistName: "David Bowie",
      artistBio: "Legendary musician and cultural icon who revolutionized rock music",
      birthDate: new Date("1947-01-08"),
      deathDate: new Date("2016-01-10"),
      totalDonations: 125000,
      donorCount: 1250,
    },
    {
      id: 2,
      artistName: "Amy Winehouse",
      artistBio: "Soulful voice that touched millions with her powerful performances",
      birthDate: new Date("1983-09-14"),
      deathDate: new Date("2011-07-23"),
      totalDonations: 89000,
      donorCount: 890,
    },
    {
      id: 3,
      artistName: "Prince",
      artistBio: "Musical genius and innovator who redefined pop and funk",
      birthDate: new Date("1958-06-07"),
      deathDate: new Date("2016-04-21"),
      totalDonations: 210000,
      donorCount: 2100,
    },
    {
      id: 4,
      artistName: "Kurt Cobain",
      artistBio: "Voice of a generation and pioneer of grunge music",
      birthDate: new Date("1967-02-20"),
      deathDate: new Date("1994-04-05"),
      totalDonations: 156000,
      donorCount: 1560,
    },
    {
      id: 5,
      artistName: "Whitney Houston",
      artistBio: "One of the greatest voices in music history",
      birthDate: new Date("1963-08-09"),
      deathDate: new Date("2012-02-11"),
      totalDonations: 178000,
      donorCount: 1780,
    },
    {
      id: 6,
      artistName: "Freddie Mercury",
      artistBio: "Iconic frontman of Queen with unparalleled stage presence",
      birthDate: new Date("1946-09-05"),
      deathDate: new Date("1991-11-24"),
      totalDonations: 245000,
      donorCount: 2450,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass p-6 rounded-xl animate-pulse">
            <div className="aspect-square bg-muted rounded-lg mb-4" />
            <div className="h-6 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const displayMemorials = memorials && memorials.length > 0 ? memorials : mockMemorials;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayMemorials.map((memorial: any) => (
        <MemorialCard
          key={memorial.id}
          id={memorial.id}
          artistName={memorial.artistName}
          artistBio={memorial.artistBio}
          birthDate={memorial.birthDate}
          deathDate={memorial.deathDate}
          profileImageUrl={memorial.profileImageUrl}
          totalDonations={memorial.totalDonations || 0}
          donorCount={memorial.donorCount || 0}
        />
      ))}
    </div>
  );
}

export default function Memorials() {
  const [isPlaying, setIsPlaying] = useState(false);
  
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

          {/* Memorial Gallery */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Memorial Gallery</h2>
            <MemorialGallery />
          </div>

          {/* 3D Vinyl Memorial Demo */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Interactive 3D Memorial</h2>
                <p className="text-muted-foreground">
                  Drag to rotate, scroll to zoom. Each candle represents a year of legacy.
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </Button>
            </div>
            <VinylMemorial artistName="LEGEND" isPlaying={isPlaying} />
          </div>

          {/* Memorial Info */}
          <div className="glass p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4">About G.Rave Memorials</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-primary">🕯️ 27 Candles</h4>
                <p className="text-muted-foreground">
                  Each candle represents a track or milestone in the artist's career, 
                  creating an eternal flame of remembrance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">💎 Smart Contracts</h4>
                <p className="text-muted-foreground">
                  Donations are automatically distributed: 98% to designated heirs, 
                  2% to platform maintenance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">🔗 Blockchain Verified</h4>
                <p className="text-muted-foreground">
                  All memorials are permanently stored on Ethereum/Polygon with 
                  IPFS metadata for eternal preservation.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">🎵 Interactive 3D</h4>
                <p className="text-muted-foreground">
                  Explore the memorial in 3D space with realistic vinyl physics 
                  and ambient candle lighting effects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
