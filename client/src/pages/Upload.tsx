import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload as UploadIcon, Music, Image, FileAudio, Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { uploadToIPFS, uploadMetadataToIPFS } from "@/lib/ipfs";

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    genre: "",
    description: "",
  });

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Размер файла превышает 100MB");
        return;
      }
      setAudioFile(file);
      toast.success(`Файл выбран: ${file.name}`);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      toast.success(`Обложка выбрана: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.artist || !audioFile) {
      toast.error("Заполните обязательные поля и выберите аудио файл");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload audio file to IPFS
      toast.info("Загрузка аудио в IPFS...");
      const audioResult = await uploadToIPFS(audioFile, (progress) => {
        setUploadProgress(progress.percentage / 2); // First 50%
      });

      // Upload cover if provided
      let coverCid = "";
      if (coverFile) {
        toast.info("Загрузка обложки в IPFS...");
        const coverResult = await uploadToIPFS(coverFile);
        coverCid = coverResult.cid;
        setUploadProgress(75);
      }

      // Create metadata
      const metadata = {
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        description: formData.description,
        audioCid: audioResult.cid,
        coverCid,
        uploadedAt: new Date().toISOString(),
      };

      // Upload metadata to IPFS
      toast.info("Загрузка метаданных...");
      const metadataResult = await uploadMetadataToIPFS(metadata);
      setUploadProgress(100);

      toast.success(
        `Трек успешно загружен! CID: ${audioResult.cid.slice(0, 8)}...`
      );

      // Reset form
      setFormData({ title: "", artist: "", genre: "", description: "" });
      setAudioFile(null);
      setCoverFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Ошибка загрузки. Попробуйте снова.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <MusicDashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <UploadIcon className="w-8 h-8 text-primary" />
            Загрузить
          </h1>
          <p className="text-muted-foreground mt-1">
            Загрузите свою музыку в децентрализованное хранилище IPFS
          </p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-semibold mb-1">IPFS Хранилище</p>
                  <p className="text-muted-foreground">
                    Ваша музыка будет сохранена в децентрализованной сети IPFS, обеспечивая
                    постоянное хранение и доступность без зависимости от централизованных серверов.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Информация о треке</CardTitle>
              <CardDescription>
                Заполните детали вашего трека
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio File */}
              <div className="space-y-2">
                <Label htmlFor="audio-file" className="text-foreground">
                  Аудио файл *
                </Label>
                <label htmlFor="audio-file" className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    {audioFile ? (
                      <>
                        <p className="text-sm text-foreground font-medium mb-1">
                          ✓ {audioFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-foreground font-medium mb-1">
                          Нажмите для выбора или перетащите файл
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MP3, WAV, FLAC (макс. 100MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioFileChange}
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover-image" className="text-foreground">
                  Обложка
                </Label>
                <label htmlFor="cover-image" className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Image className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    {coverFile ? (
                      <p className="text-sm text-foreground font-medium mb-1">
                        ✓ {coverFile.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-foreground font-medium mb-1">
                          Загрузить обложку
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG (рекомендуется 1000x1000px)
                        </p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Название трека *
                </Label>
                <Input
                  id="title"
                  placeholder="Введите название"
                  className="bg-secondary border-border text-foreground"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Artist */}
              <div className="space-y-2">
                <Label htmlFor="artist" className="text-foreground">
                  Исполнитель *
                </Label>
                <Input
                  id="artist"
                  placeholder="Введите имя исполнителя"
                  className="bg-secondary border-border text-foreground"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-foreground">
                  Жанр
                </Label>
                <Input
                  id="genre"
                  placeholder="Например: Synthwave, Future Bass"
                  className="bg-secondary border-border text-foreground"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  placeholder="Расскажите о вашем треке..."
                  className="bg-secondary border-border text-foreground min-h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Upload Button */}
              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Прогресс загрузки</span>
                    <span className="text-primary font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full gradient-violet"
                size="lg"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка в IPFS...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Загрузить трек
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MusicDashboardLayout>
  );
}
