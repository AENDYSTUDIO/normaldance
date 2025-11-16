import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, Upload, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UploadTrack() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedTrackId, setUploadedTrackId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    releaseYear: new Date().getFullYear(),
    description: "",
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const createTrackMutation = trpc.tracks.create.useMutation({
    onSuccess: (data) => {
      setUploadedTrackId(data.id);
      toast.success("Track uploaded successfully!");
      setUploading(false);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          title: "",
          artist: "",
          album: "",
          genre: "",
          releaseYear: new Date().getFullYear(),
          description: "",
        });
        setAudioFile(null);
        setCoverImage(null);
        setAudioPreview(null);
        setCoverPreview(null);
        setUploadedTrackId(null);
        setUploadProgress(0);
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      setUploadProgress(0);
    },
  });

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select a valid audio file");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Audio file must be less than 50MB");
      return;
    }

    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));

    // Extract duration
    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener("loadedmetadata", () => {
      console.log("Audio duration:", Math.floor(audio.duration));
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    if (!formData.title || !formData.artist) {
      toast.error("Title and artist are required");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // In a real implementation, you would:
      // 1. Upload audio file to S3/IPFS
      // 2. Upload cover image to S3
      // 3. Get the URLs and CIDs
      // For now, we'll use mock data

      const mockIpfsCid = "Qm" + Math.random().toString(36).substring(2, 15);
      const mockCoverUrl = coverPreview || undefined;

      // Get audio duration
      const audio = new Audio(audioPreview!);
      await new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", resolve);
      });
      const duration = Math.floor(audio.duration);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create track in database
      await createTrackMutation.mutateAsync({
        title: formData.title,
        artist: formData.artist,
        album: formData.album || undefined,
        genre: formData.genre || undefined,
        releaseYear: formData.releaseYear || undefined,
        description: formData.description || undefined,
        duration,
        ipfsCid: mockIpfsCid,
        coverImageUrl: mockCoverUrl,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
    }
  };

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
          <Music className="w-16 h-16 text-primary mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to upload tracks
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
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Upload <span className="gradient-text">Track</span>
            </h1>
            <p className="text-muted-foreground">
              Share your music with the world on the blockchain
            </p>
          </div>

          {uploadedTrackId ? (
            <div className="glass p-12 rounded-2xl text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Track Uploaded!</h2>
              <p className="text-muted-foreground mb-6">
                Your track has been successfully uploaded to IPFS
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/explore">Browse Tracks</Link>
                </Button>
                <Button variant="outline" onClick={() => setUploadedTrackId(null)}>
                  Upload Another
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Audio File Upload */}
              <div className="glass p-6 rounded-xl">
                <Label className="text-lg font-semibold mb-4 block">Audio File *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  {audioPreview ? (
                    <div className="space-y-3">
                      <Music className="w-12 h-12 text-primary mx-auto" />
                      <p className="font-medium">{audioFile?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(audioFile!.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <audio controls src={audioPreview} className="w-full mt-3" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAudioFile(null);
                          setAudioPreview(null);
                        }}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">Click to upload audio</p>
                      <p className="text-sm text-muted-foreground">
                        MP3, WAV, FLAC up to 50MB
                      </p>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="glass p-6 rounded-xl">
                <Label className="text-lg font-semibold mb-4 block">Cover Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  {coverPreview ? (
                    <div className="space-y-3">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-48 h-48 object-cover rounded-lg mx-auto"
                      />
                      <p className="font-medium">{coverImage?.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview(null);
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">Click to upload cover</p>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG up to 5MB (recommended: 1400x1400)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Track Metadata */}
              <div className="glass p-6 rounded-xl space-y-4">
                <Label className="text-lg font-semibold block">Track Information</Label>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter track title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      placeholder="Enter artist name"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="album">Album</Label>
                    <Input
                      id="album"
                      value={formData.album}
                      onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                      placeholder="Enter album name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="e.g., Electronic, Rock"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="releaseYear">Release Year</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about this track..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="glass p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="font-medium">Uploading to IPFS...</span>
                    <span className="text-sm text-muted-foreground ml-auto">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full vinyl-glow"
                size="lg"
                disabled={uploading || !audioFile}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Track
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
