import { generateEmbedding } from "./embedding.service";
import { client, COLLECTION_NAME } from "./qdrant.service";

export const createPayloadIndexes = async () => {
  await client.createPayloadIndex(COLLECTION_NAME, {
    field_name: "videoId",
    field_schema: "keyword",
    wait: true,
  });
};

export const retrieveChunks = async (question: string, vdoIds: string[]) => {
  const queryVector = await generateEmbedding(question);

  const result = await client.query(COLLECTION_NAME, {
    query: queryVector,
    limit: 10,
    with_payload: true,
    filter: {
      should: vdoIds.map((videoId) => ({
        key: "videoId",
        match: { value: videoId },
      })),
    },
  });

  return result.points.map((point) => ({
    score: point.score,
    ...point.payload,
  }));
};
