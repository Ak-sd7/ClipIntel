import { TranscriptChunk, TranscriptItem } from "./types";
import { getEncoding } from "js-tiktoken";

const encoder = getEncoding("cl100k_base");

const getTokenCount = (text: string): number => {
  return encoder.encode(text).length;
};

const endsSentence = (text: string): boolean => {
  return /[.!?]["')\]]?\s*$/.test(text.trim());
};

const buildChunk = (
  transcript: TranscriptItem[],
  startIndex: number,
  endIndex: number,
  text: string,
  tokenCount: number,
  videoId: string,
  chunkIndex: number
): TranscriptChunk => {
  const lastScript = transcript[endIndex];

  return {
    id: `${videoId}-${chunkIndex}`,
    videoId,
    text: text.trim(),
    startTime: transcript[startIndex].startInSeconds,
    endTime: lastScript.startInSeconds + lastScript.durationInSeconds,
    segmentStartIndex: startIndex,
    segmentEndIndex: endIndex,
    tokenCount,
  };
};

const getOverlapStartIndex = (
  segmentTokenCounts: number[],
  startIndex: number,
  endIndex: number,
  overlapTokens: number
): number => {
  let tokens = 0;

  for (let i = endIndex; i >= startIndex; i--) {
    tokens += segmentTokenCounts[i];

    if (tokens >= overlapTokens) {
      return i;
    }
  }

  return startIndex;
};

export const transcriptChunk = (
  transcript: TranscriptItem[],
  videoId: string
): TranscriptChunk[] => {
  const chunks: TranscriptChunk[] = [];

  const targetTokens = 400;
  const maxTokens = 500;
  const overlapRatio = 0.15;

  const segmentTokenCounts = transcript.map((script) =>
    getTokenCount(script.text)
  );

  let currentText = "";
  let tokenCount = 0;
  let startIndex = 0;
  let chunkIndex = 0;
  let lastClosedIndex = -1;

  for (let i = 0; i < transcript.length; i++) {
    const script = transcript[i];

    currentText += ` ${script.text}`;
    tokenCount += segmentTokenCounts[i];

    const reachedTarget =
      tokenCount >= targetTokens && endsSentence(currentText);

    const reachedMax = tokenCount >= maxTokens;

    if (reachedTarget || reachedMax) {
      chunks.push(
        buildChunk(
          transcript,
          startIndex,
          i,
          currentText,
          tokenCount,
          videoId,
          chunkIndex
        )
      );

      chunkIndex++;
      lastClosedIndex = i;

      // Keep ~15% of the closed chunk as overlap.
      const overlapTokens = Math.floor(tokenCount * overlapRatio);

      startIndex = getOverlapStartIndex(
        segmentTokenCounts,
        startIndex,
        i,
        overlapTokens
      );

      currentText = "";

      for (let j = startIndex; j <= i; j++) {
        currentText += ` ${transcript[j].text}`;
      }

      tokenCount = 0;

      for (let j = startIndex; j <= i; j++) {
        tokenCount += segmentTokenCounts[j];
      }
    }
  }

  if (lastClosedIndex < transcript.length - 1) {
    chunks.push(
      buildChunk(
        transcript,
        startIndex,
        transcript.length - 1,
        currentText,
        tokenCount,
        videoId,
        chunkIndex
      )
    );
  }

  return chunks;
};