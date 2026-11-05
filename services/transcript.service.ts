import {
  fetchTranscript,
  TranscriptSegment,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptNotAvailableLanguageError,
  YoutubeTranscriptVideoUnavailableError,
  listLanguages,
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
    let data: TranscriptSegment[];

    try {
      data = await fetchTranscript(vdoId, { lang });
    } catch (error) {
      if (!(error instanceof YoutubeTranscriptNotAvailableLanguageError)) {
        throw error;
      }

      const languages = await listLanguages(vdoId);

      if (languages.length === 0) {
        return { status: "no_transcript_available" };
      }

      const fallbackLanguage =
        languages.find((item) => item.languageCode === "en")?.languageCode ??
        languages[0].languageCode;

      data = await fetchTranscript(vdoId, {
        lang: fallbackLanguage,
      });
    }

    const transcript: TranscriptItem[] = data.map((item) => ({
      text: item.text,
      startInSeconds: item.offset,
      formattedTimestamp: formatTimestamp(item.offset),
      durationInSeconds: item.duration,
    }));

    return {
      status: "success",
      data: transcript,
    };
  } catch (error) {
    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      console.error("Video is unavailable:", error.message);
      return { status: "not_found" };
    }

    if (error instanceof YoutubeTranscriptDisabledError) {
      console.error("Transcripts are disabled:", error.message);
      return { status: "disabled" };
    }

    if (error instanceof YoutubeTranscriptNotAvailableError) {
      console.error("No transcript available:", error.message);
      return { status: "no_transcript_available" };
    }

    if (error instanceof YoutubeTranscriptNotAvailableLanguageError) {
      console.error("Transcript language unavailable:", error.message);
      return { status: "lang_not_available" };
    }

    console.error("Unexpected transcript error:", error);

    return {
      status: "api_error",
      statusCode: 502,
    };
  }
};
