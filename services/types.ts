export interface urlParseResult {
  valid: boolean;
  error?: string;
  videoId?: string | null;
}

export interface YouTubeVideoSnippetRaw {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
  };
}

export interface YouTubeVideoStatisticsRaw {
  viewCount: string;
  likeCount?: string;
  favoriteCount: string;
  commentCount?: string;
}

export interface YoutubeVideoRaw {
  id: string;
  snippet: YouTubeVideoSnippetRaw;
  statistics: YouTubeVideoStatisticsRaw;
}

export interface YouTubeApiResponse {
  kind: string;
  etag: string;
  items?: YoutubeVideoRaw[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface VideoMetaData {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  thumbnailUrl: string;
  platform: "youtube";
}

export type MetadataResult =
  | { status: "success"; data: VideoMetaData }
  | { status: "not_found" }
  | { status: "api_error"; statusCode: number }
  | { status: "config_error" };

export interface TranscriptItem {
  text: string;
  startInSeconds: number;
  formattedTimestamp: string;
  durationInSeconds: number;
}

export type TranscriptResult =
  | { status: "success"; data: TranscriptItem[] }
  | { status: "api_error"; statusCode: number }
  | { status: "not_found" }
  | { status: "no_transcript_available" }
  | { status: "lang_not_available" }
  | { status: "disabled" };

type MetadataErrorStatus =
  Exclude<MetadataResult["status"], "success">;

type TranscriptErrorStatus =
  Exclude<TranscriptResult["status"], "success">;

export type AnalyzeVideoResult = {
  id?: string;
  status: "success" | "partial" | "error";
  message?: string;
  data: {
    metadata?: VideoMetaData;
    transcript?: TranscriptItem[];
  };
  errors: {
    url?: string;
    metadata?: {
      status: MetadataErrorStatus;
      statusCode?: number;
    };
    transcript?: {
      status: TranscriptErrorStatus;
      statusCode?: number;
    };
  };
};
