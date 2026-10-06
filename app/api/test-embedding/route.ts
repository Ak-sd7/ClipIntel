import { NextResponse } from "next/server";
import { generateEmbedding } from "@/services/embedding.service";
import { transcriptChunk } from "@/services/transcript.chunk.service";
import { vectorizeChunk } from "@/services/vectorize.service";
import { upsertChunks } from "@/services/qdrant.service";
import { TranscriptItem } from "@/services/types";

const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
};

export async function GET() {
  // -----------------------------
  // 1. Test embedding similarity
  // -----------------------------

  const embedding1 = await generateEmbedding(
    "How do I increase YouTube engagement?",
  );

  const embedding2 = await generateEmbedding(
    "Tips for getting more views and interaction on YouTube",
  );

  const embedding3 = await generateEmbedding(
    "How to cook pasta",
  );

  const youtubeSimilarity = cosineSimilarity(
    embedding1,
    embedding2,
  );

  const cookingSimilarity = cosineSimilarity(
    embedding1,
    embedding3,
  );

  // -----------------------------
  // 2. Test transcript chunking
  // -----------------------------

  const transcript: TranscriptItem[] = [
    {
      text: "The first thing you need to do is create a strong hook.",
      startInSeconds: 0,
      formattedTimestamp: "00:00",
      durationInSeconds: 4,
    },
    {
      text: "Your first few seconds are extremely important because they determine whether people keep watching.",
      startInSeconds: 4,
      formattedTimestamp: "00:04",
      durationInSeconds: 6,
    },
    {
      text: "You should also make sure your title and thumbnail match the promise of the video.",
      startInSeconds: 10,
      formattedTimestamp: "00:10",
      durationInSeconds: 6,
    },
  ];

  const videoId = "test-video-123";

  const chunks = transcriptChunk(
    transcript,
    videoId,
  );

  // -----------------------------
  // 3. Generate embeddings
  // -----------------------------

  const points = await vectorizeChunk(chunks);

  // -----------------------------
  // 4. Store in Qdrant
  // -----------------------------

  await upsertChunks(points);

  return NextResponse.json({
    status: "success",

    similarity: {
      youtubeSimilarity,
      cookingSimilarity,
    },

    chunks: {
      count: chunks.length,
      data: chunks,
    },

    qdrant: {
      pointsUpserted: points.length,
    },
  });
}