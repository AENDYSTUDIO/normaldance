import { Heart, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface MemorialCardProps {
  id: number;
  artistName: string;
  artistBio?: string;
  birthDate?: Date;
  deathDate?: Date;
  profileImageUrl?: string;
  totalDonations?: number;
  donorCount?: number;
}

export function MemorialCard({
  id,
  artistName,
  artistBio,
  birthDate,
  deathDate,
  profileImageUrl,
  totalDonations = 0,
  donorCount = 0,
}: MemorialCardProps) {
  const formatDate = (date?: Date) => {
    if (!date) return "Unknown";
    return new Date(date).getFullYear();
  };

  const lifespan = birthDate && deathDate 
    ? `${formatDate(birthDate)} - ${formatDate(deathDate)}`
    : "Legendary Artist";

  return (
    <Link href={`/memorials/${id}`}>
      <a className="block group">
        <div className="glass rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:scale-[1.02]">
          {/* Profile Image */}
          <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={artistName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-8xl opacity-30">🎵</div>
              </div>
            )}
            
            {/* Overlay with candle icon */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Heart className="w-4 h-4 text-primary" />
                <span>View Memorial</span>
              </div>
            </div>

            {/* Candle count badge */}
            <div className="absolute top-3 right-3 glass px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              🕯️ <span>27</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
              {artistName}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{lifespan}</p>

            {artistBio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {artistBio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-1 text-sm">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">${totalDonations.toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {donorCount} {donorCount === 1 ? "donor" : "donors"}
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
