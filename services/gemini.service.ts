
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
- Answer the user's question directly in 3-5 sentences maximum.
- Use only the supplied transcript context.
- Compare Video A and Video B when relevant.
- Cite supporting claims using [S1], [S2], etc.
- Do not reproduce transcript passages.
- Do not list timestamps or source details in your answer.
- Do not include a Sources section.
- Never repeat the context in your response.
- If evidence is insufficient, say so briefly.

Transcript context:
${context}

Question: ${question}

Return ONLY the answer.
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
