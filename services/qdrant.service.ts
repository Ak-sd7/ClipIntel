import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantPoint } from "./types";

export const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

export const COLLECTION_NAME = "video_transcripts";

export const createCollection = async () => {
  const { exists } = await client.collectionExists(COLLECTION_NAME);

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });

    console.log(`Collection '${COLLECTION_NAME}' created`);
  }
};

export const upsertChunks = async (points: QdrantPoint[]) => {
  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });
};

export const videoHasChunks = async (videoId: string): Promise<boolean> => {
  const result = await client.scroll(COLLECTION_NAME, {
    filter: {
      must: [
        {
          key: "videoId",
          match: { value: videoId },
        },
      ],
    },
    limit: 1,
    with_payload: false,
    with_vector: false,
  });

  return result.points.length > 0;
};
