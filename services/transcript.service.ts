import {
  fetchTranscript,
  TranscriptSegment,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptNotAvailableLanguageError,
  YoutubeTranscriptVideoUnavailableError,
} from "youtube-transcript-plus";
import { TranscriptItem, TranscriptResult } from "./types";

const formatTimestamp = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${mins}:${pad(secs)}`;
};

export const fetchVideoTranscript = async (
  vdoId: string,
  lang: string = "en",
): Promise<TranscriptResult> => {
  try {
    const data: TranscriptSegment[] = await fetchTranscript(vdoId, { lang });

    const Transcript: TranscriptItem[] = data.map((item) => ({
      text: item.text,
      startInSeconds: item.offset,
      formattedTimestamp: formatTimestamp(item.offset),
      durationInSeconds: item.duration,
    }));

    return {
      status: "success",
      data: Transcript,
    };
  } catch (error) {
    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      console.error("Video is unavailable:", error.message);
      return {
        status: "not_found",
      };
    } else if (error instanceof YoutubeTranscriptDisabledError) {
      console.error("Transcripts are disabled for this video:", error.message);
      return {
        status: "disabled",
      };
    } else if (error instanceof YoutubeTranscriptNotAvailableError) {
      console.error("No transcript available:", error.message);
      return {
        status: "no_transcript_available",
      };
    } else if (error instanceof YoutubeTranscriptNotAvailableLanguageError) {
      console.error(
        "Transcript not available in the specified language:",
        error.message,
      );
      return {
        status: "lang_not_available",
      };
    } else {
      console.error("An unexpected error occurred:", error);
      return {
        status: "api_error",
        statusCode: 502,
      };
    }
  }
};
