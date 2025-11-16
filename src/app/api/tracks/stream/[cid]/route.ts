
import { NextRequest, NextResponse } from "next/server";
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';
import { logger } from "@/lib/utils/logger";

// Re-usable Helia instance
let heliaInstance: any;
let fs: any;

async function getHelia() {
  if (!heliaInstance) {
    heliaInstance = await createHelia();
    fs = unixfs(heliaInstance);
  }
  return { helia: heliaInstance, fs };
}

/**
 * GET /api/tracks/stream/{cid}
 * Streams an audio file directly from IPFS.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { cid: string } }
) {
  const { cid } = params;

  if (!cid) {
    return new NextResponse("CID is required", { status: 400 });
  }

  try {
    const { fs } = await getHelia();
    const fileCid = CID.parse(cid);

    // Get the async iterable stream from IPFS
    const ipfsStream = fs.cat(fileCid);

    // Create a web ReadableStream from the async iterable
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of ipfsStream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          logger.error("Error while reading from IPFS stream", error as Error, { cid });
          controller.error(error);
        }
      },
      cancel() {
        logger.info("Stream cancelled by client", { cid });
      },
    });

    // Return the stream as the response
    // The browser will handle buffering and playback
    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg", // Assuming MP3, adjust if other formats are used
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    logger.error("Failed to stream file from IPFS", error as Error, { cid });

    if (error instanceof Error && error.message.includes("invalid cid")) {
        return new NextResponse("Invalid CID format", { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
