import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, User, Heart, ListMusic, TrendingUp, Share2, Edit, Loader2, Twitter, Facebook } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState(user?.name || "");

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-primary mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your profile
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out my profile on ${APP_TITLE}!`;
    
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    }
    
    toast.success("Opening share dialog...");
  };

  const handleSaveProfile = () => {
    // In production, this would call a tRPC mutation
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

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
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container max-w-5xl">
          {/* Profile Header */}
          <div className="glass p-8 rounded-2xl mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                
                {/* User Info */}
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Display name"
                        className="max-w-xs"
                      />
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={2}
                        className="max-w-xs"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
                      <p className="text-muted-foreground mb-2">{user?.email}</p>
                      {bio && <p className="text-sm max-w-md">{bio}</p>}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-2 pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground mr-2">Share profile:</span>
              <Button variant="ghost" size="sm" onClick={() => handleShare("twitter")}>
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShare("facebook")}>
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Profile link copied!");
              }}>
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="glass p-6 rounded-xl text-center">
              <Music className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-sm text-muted-foreground">Tracks Played</div>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <ListMusic className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-sm text-muted-foreground">Playlists</div>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">0h</div>
              <div className="text-sm text-muted-foreground">Listening Time</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
              <Button asChild className="mt-4">
                <Link href="/explore">Start Listening</Link>
              </Button>
            </div>
          </div>

          {/* Favorite Tracks */}
          <div className="glass p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Favorite Tracks</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/explore">Browse More</Link>
              </Button>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No favorites yet</p>
              <p className="text-sm mt-1">Like tracks to see them here</p>
            </div>
          </div>

          {/* Playlists */}
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Playlists</h2>
              <Button variant="outline" size="sm">
                <Music className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No playlists yet</p>
              <p className="text-sm mt-1">Create your first playlist to organize your music</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
