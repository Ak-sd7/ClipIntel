
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DO_API_KEY!,
  baseURL: "https://inference.do-ai.run/v1",
});

export interface RetrievedChunk {
  score: number;
  videoId: string;
  chunkId: string;
  text: string;
  startTime: number;
  endTime: number;
}

export const generateAnswer = async (
  question: string,
  chunks: RetrievedChunk[],
  videoIds: string[]
) => {
  const context = chunks.map((chunk) => {
    const videoLabel =
      chunk.videoId === videoIds[0] ? "Video A" :
      chunk.videoId === videoIds[1] ? "Video B" :
      "Unknown video";

    return `
Video: ${videoLabel}
Transcript: ${chunk.text}
`;
  }).join("\n");

  const prompt = `
You are ClipIntel, a concise video analysis assistant.

Instructions:
- Answer the question directly in 3-5 sentences maximum.
- Use only the provided transcript context.
- Compare Video A and Video B when relevant.
- Never invent facts.
- Do not include source IDs, citations, references, timestamps, or a Sources section.
- Do not reproduce transcript passages.
- If evidence is insufficient, say so briefly.
- Respond in the user's language.

Context:
${context}

Question: ${question}

Return only the answer. No citations.
`;

  const response = await client.chat.completions.create({
    model: "deepseek-v4.1-flash",
    messages: [
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message?.content ??
    "I couldn't generate an answer.";
};
