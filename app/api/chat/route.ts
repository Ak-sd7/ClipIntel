import { NextRequest, NextResponse } from "next/server";
import { retrieveChunks } from "@/services/retrieval.service";
import { generateAnswer } from "@/services/gemini.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { question, videoIds } = body;

    if (
      !question ||
      typeof question !== "string" ||
      !Array.isArray(videoIds) ||
      videoIds.length !== 2 ||
      videoIds.some(
        (id: unknown) => typeof id !== "string" || !id.trim(),
      )
    ) {
      return NextResponse.json(
        { error: "Question and two valid video IDs are required." },
        { status: 400 },
      );
    }

	// chunks retrieva;
    const chunks = await retrieveChunks(question, videoIds);

    if (chunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find relevant information in either video.",
        sources: [],
      });
    }

    // LLM
    const answer = await generateAnswer(
      question,
      chunks,
      videoIds,
    );

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while generating the answer." },
      { status: 500 },
    );
  }
}