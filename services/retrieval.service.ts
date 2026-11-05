import { generateEmbedding } from "./embedding.service";
import { client, COLLECTION_NAME } from "./qdrant.service";

export const createPayloadIndexes = async () => {
  await client.createPayloadIndex(COLLECTION_NAME, {
    field_name: "videoId",
    field_schema: "keyword",
    wait: true,
  });
};

export const retrieveChunks = async (
  question: string,
  videoIds: string[],
) => {
  const queryVector = await generateEmbedding(question);

  const results = await Promise.all(
    videoIds.map(async (videoId) => {
      const result = await client.query(COLLECTION_NAME, {
        query: queryVector,
        limit: 5,
        with_payload: true,
        filter: {
          must: [
            {
              key: "videoId",
              match: { value: videoId },
            },
          ],
        },
      });

      return result.points.map((point) => {
        const payload = point.payload;

        return {
          score: point.score,
          videoId: String(payload?.videoId ?? ""),
          chunkId: String(payload?.chunkId ?? ""),
          text: String(payload?.text ?? ""),
          startTime: Number(payload?.startTime ?? 0),
          endTime: Number(payload?.endTime ?? 0),
        };
      });
    }),
  );

  return results.flat().sort((a, b) => b.score - a.score);
};
