import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Music, Heart, Coins, ArrowLeft, Loader2, User } from "lucide-react";
import { Link, useRoute } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { VinylMemorial } from "@/components/VinylMemorial";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MemorialDetail() {
  const [, params] = useRoute("/memorials/:id");
  const memorialId = params?.id ? parseInt(params.id) : 0;
  
  const { user, isAuthenticated } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("10");
  const [donationMessage, setDonationMessage] = useState("");
  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: memorial, isLoading } = trpc.memorials.getById.useQuery({ id: memorialId });
  const { data: donations } = trpc.memorials.getDonations.useQuery({ memorialId });

  const donateMutation = trpc.memorials.donate.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your donation!");
      setDonateOpen(false);
      setDonationAmount("10");
      setDonationMessage("");
      setDonorName("");
    },
    onError: (error) => {
      toast.error(`Donation failed: ${error.message}`);
    },
  });

  const handleDonate = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to donate");
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await donateMutation.mutateAsync({
      memorialId,
      amount,
      currency: "USD",
      paymentMethod: "crypto",
      message: donationMessage || undefined,
      donorName: donorName || undefined,
      isAnonymous,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Memorial Not Found</h1>
          <Button asChild>
            <Link href="/memorials">Back to Memorials</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const donorCount = donations?.length || 0;

  const formatDate = (date?: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/memorials">
                <ArrowLeft className="w-4 h-4 mr-2" />
                All Memorials
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-3">
                <span className="gradient-text">{memorial.artistName}</span>
              </h1>
              {memorial.birthDate && memorial.deathDate && (
                <p className="text-xl text-muted-foreground mb-4">
                  {formatDate(memorial.birthDate)} - {formatDate(memorial.deathDate)}
                </p>
              )}
              {memorial.artistBio && (
                <p className="text-muted-foreground max-w-3xl">{memorial.artistBio}</p>
              )}
            </div>

            <Button
              size="lg"
              className="vinyl-glow"
              onClick={() => setDonateOpen(true)}
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="glass p-6 rounded-xl text-center">
              <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary mb-1">
                ${totalDonations.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Donations</div>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <User className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary mb-1">{donorCount}</div>
              <div className="text-sm text-muted-foreground">Donors</div>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <div className="text-3xl mb-2">🕯️</div>
              <div className="text-3xl font-bold text-primary mb-1">27</div>
              <div className="text-sm text-muted-foreground">Candle Tracks</div>
            </div>
          </div>

          {/* 3D Memorial */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Interactive 3D Memorial</h2>
                <p className="text-muted-foreground">
                  Drag to rotate, scroll to zoom. Each candle represents a milestone.
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </Button>
            </div>
            <VinylMemorial artistName={memorial.artistName} isPlaying={isPlaying} />
          </div>

          {/* Blockchain Info */}
          {memorial.smartContractAddress && (
            <div className="glass p-6 rounded-xl mb-12">
              <h3 className="text-lg font-semibold mb-4">Blockchain Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Network</div>
                  <div className="font-mono">{memorial.blockchainNetwork || "Ethereum"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Smart Contract</div>
                  <div className="font-mono text-xs break-all">{memorial.smartContractAddress}</div>
                </div>
                {memorial.metadataIpfsCid && (
                  <div className="md:col-span-2">
                    <div className="text-muted-foreground mb-1">IPFS Metadata</div>
                    <div className="font-mono text-xs break-all">{memorial.metadataIpfsCid}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Donations */}
          {donations && donations.length > 0 && (
            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Recent Donations</h3>
              <div className="space-y-3">
                {donations.slice(0, 10).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {donation.isAnonymous ? "Anonymous" : donation.donorName || "Anonymous"}
                        </div>
                        {donation.message && (
                          <div className="text-sm text-muted-foreground">{donation.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      ${donation.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Donate Dialog */}
      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support {memorial.artistName}'s Legacy</DialogTitle>
            <DialogDescription>
              98% goes to designated heirs, 2% to platform maintenance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="amount">Donation Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                min="1"
                step="1"
              />
            </div>

            {!isAnonymous && (
              <div>
                <Label htmlFor="donorName">Your Name (Optional)</Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                placeholder="Leave a message of remembrance..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Donate anonymously
              </Label>
            </div>

            <Button
              className="w-full vinyl-glow"
              onClick={handleDonate}
              disabled={donateMutation.isPending}
            >
              {donateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Donate ${donationAmount}
                </>
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-center text-muted-foreground">
                <a href={getLoginUrl()} className="text-primary hover:underline">
                  Sign in
                </a>{" "}
                to make a donation
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
