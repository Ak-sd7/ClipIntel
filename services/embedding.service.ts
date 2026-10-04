import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";

let extractor: FeatureExtractionPipeline | null = null;

const getExtractor = async (): Promise<FeatureExtractionPipeline> => {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/bge-small-en-v1.5"
    );
  }

  return extractor;
};

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  const extractor = await getExtractor();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};