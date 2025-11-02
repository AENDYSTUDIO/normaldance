
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADED_TRACKS_KEY = 'DOWNLOADED_TRACKS';

export interface DownloadedTrackMetadata {
  id: string;
  title: string;
  artistName: string;
  ipfsHash: string;
  coverImage?: string;
  duration: number;
  localUri: string; // The local file URI of the downloaded track
}

class DownloadManager {
  private tracks: Record<string, DownloadedTrackMetadata> = {};

  constructor() {
    this.loadMetadataFromStorage();
  }

  private async loadMetadataFromStorage() {
    try {
      const storedTracks = await AsyncStorage.getItem(DOWNLOADED_TRACKS_KEY);
      if (storedTracks) {
        this.tracks = JSON.parse(storedTracks);
      }
    } catch (error) {
      console.error("Failed to load downloaded tracks from storage", error);
    }
  }

  private async saveMetadataToStorage() {
    try {
      await AsyncStorage.setItem(DOWNLOADED_TRACKS_KEY, JSON.stringify(this.tracks));
    } catch (error) {
      console.error("Failed to save downloaded tracks to storage", error);
    }
  }

  public async isTrackDownloaded(trackId: string): Promise<boolean> {
    return !!this.tracks[trackId];
  }

  public async getDownloadedTracks(): Promise<DownloadedTrackMetadata[]> {
    return Object.values(this.tracks);
  }

  public async downloadTrack(
    track: { id: string; title: string; artistName: string; ipfsHash: string; coverImage?: string; duration: number },
    onProgress?: (progress: number) => void
  ): Promise<DownloadedTrackMetadata> {
    if (await this.isTrackDownloaded(track.id)) {
      console.log("Track already downloaded");
      return this.tracks[track.id];
    }

    const streamUrl = `https://your-streaming-api-endpoint.com/api/tracks/stream/${track.ipfsHash}`;
    const localUri = `${FileSystem.documentDirectory}${track.ipfsHash}.mp3`;

    const downloadResumable = FileSystem.createDownloadResumable(
      streamUrl,
      localUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        if (onProgress) {
          onProgress(progress * 100);
        }
      }
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      console.log('Finished downloading to ', uri);

      const metadata: DownloadedTrackMetadata = {
        ...track,
        localUri: uri,
      };

      this.tracks[track.id] = metadata;
      await this.saveMetadataToStorage();

      return metadata;
    } catch (e) {
      console.error("Failed to download track", e);
      throw e;
    }
  }

  public async deleteTrack(trackId: string): Promise<void> {
    const track = this.tracks[trackId];
    if (!track) {
      console.log("Track not found for deletion");
      return;
    }

    try {
      await FileSystem.deleteAsync(track.localUri);
      delete this.tracks[trackId];
      await this.saveMetadataToStorage();
      console.log(`Deleted track ${trackId} from device.`);
    } catch (error) {
      console.error(`Failed to delete track ${trackId}`, error);
    }
  }
}

// Export a singleton instance
export const downloadManager = new DownloadManager();
