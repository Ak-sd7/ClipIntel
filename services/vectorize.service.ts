import { generateEmbedding } from "./embedding.service";
import { QdrantPoint, TranscriptChunk } from "./types";

export const vectorizeChunk = async (chunks: TranscriptChunk[]): Promise<QdrantPoint[]> => {
	const points = await Promise.all(
	chunks.map(async (chunk) => ({
		id: crypto.randomUUID(),
		vector: await generateEmbedding(chunk.text),
		payload: {
			chunkId: chunk.id,
			videoId: chunk.videoId,
			text: chunk.text,
			startTime: chunk.startTime,
			endTime: chunk.endTime,
			segmentStartIndex: chunk.segmentStartIndex,
			segmentEndIndex: chunk.segmentEndIndex,
			tokenCount: chunk.tokenCount,
			},
		}))
	);
	return points;
}