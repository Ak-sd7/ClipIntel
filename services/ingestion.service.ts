import { transcriptChunk } from "./transcript.chunk.service";
import { videoHasChunks, upsertChunks } from "./qdrant.service";
import { vectorizeChunk } from "./vectorize.service";
import { TranscriptItem } from "./types";

export const ingestTranscript = async (
  videoId: string,
  transcript: TranscriptItem[],
): Promise<"already_indexed" | "indexed"> => {
  const alreadyIndexed = await videoHasChunks(videoId);

  if (alreadyIndexed) {
    return "already_indexed";
  }

  const chunks = transcriptChunk(transcript, videoId);
  const points = await vectorizeChunk(chunks);

  await upsertChunks(points);

  return "indexed";
};