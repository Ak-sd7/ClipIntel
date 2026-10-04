import { NextResponse } from "next/server";
import { generateEmbedding } from "@/services/embedding.service";

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
  const embedding1 = await generateEmbedding(
    "How do I increase YouTube engagement?",
  );

  const embedding2 = await generateEmbedding(
    "Tips for getting more views and interaction on YouTube",
  );

  const embedding3 = await generateEmbedding("How to cook pasta");

  return NextResponse.json({
    youtubeSimilarity: cosineSimilarity(embedding1, embedding2),
    cookingSimilarity: cosineSimilarity(embedding1, embedding3),
  });
}
