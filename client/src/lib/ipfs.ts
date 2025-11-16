import { create } from "ipfs-http-client";

// Configure IPFS client - using public gateways for demo
// In production, use your own IPFS node or Pinata/Infura
const ipfsClient = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface IPFSUploadResult {
  cid: string;
  path: string;
  size: number;
  url: string;
}

/**
 * Upload a file to IPFS
 * @param file - File to upload
 * @param onProgress - Progress callback
 * @returns IPFS CID and gateway URL
 */
export async function uploadToIPFS(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<IPFSUploadResult> {
  try {
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    // Upload to IPFS
    const result = await ipfsClient.add(uint8Array, {
      progress: (bytes) => {
        if (onProgress) {
          onProgress({
            loaded: bytes,
            total: file.size,
            percentage: Math.round((bytes / file.size) * 100),
          });
        }
      },
    });

    const cid = result.path;
    const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;

    return {
      cid,
      path: result.path,
      size: result.size,
      url: gatewayUrl,
    };
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata - JSON metadata object
 * @returns IPFS CID and gateway URL
 */
export async function uploadMetadataToIPFS(
  metadata: Record<string, any>
): Promise<IPFSUploadResult> {
  try {
    const metadataString = JSON.stringify(metadata);
    const result = await ipfsClient.add(metadataString);

    const cid = result.path;
    const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;

    return {
      cid,
      path: result.path,
      size: result.size,
      url: gatewayUrl,
    };
  } catch (error) {
    console.error("IPFS metadata upload error:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
}

/**
 * Get IPFS gateway URL from CID
 * @param cid - IPFS CID
 * @returns Gateway URL
 */
export function getIPFSUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}
