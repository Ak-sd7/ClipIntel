import { fetchVideoTranscript } from "@/services/transcript.service";
import { AnalyzeVideoResult, urlParseResult } from "@/services/types";
import { parseVideoUrl } from "@/services/video.service";
import { fetchMetaData } from "@/services/youtube.service";
import { NextRequest, NextResponse } from "next/server";
import { ingestTranscript } from "@/services/ingestion.service";

export type AnalyzeResponse = {
  status: "success" | "partial" | "error";
  message?: string;
  errors?: {
    videoA?: string;
    videoB?: string;
  };
  videos?: {
    videoA: AnalyzeVideoResult;
    videoB: AnalyzeVideoResult;
  };
};

const getVideoStatus = (video: AnalyzeVideoResult) => {
  const hasMetadata = !!video.data?.metadata;
  const hasTranscript = !!video.data?.transcript;

  if (hasMetadata && hasTranscript) {
    return "success";
  }

  if (hasMetadata || hasTranscript) {
    return "partial";
  }

  return "error";
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<AnalyzeResponse>> => {
  try {
    const body = await req.json();
    const { url1, url2 } = body;

    const parseResp1: urlParseResult = parseVideoUrl(url1);
    const parseResp2: urlParseResult = parseVideoUrl(url2);

    if (
      !parseResp1.valid ||
      !parseResp1.videoId ||
      !parseResp2.valid ||
      !parseResp2.videoId
    ) {
      return NextResponse.json(
        {
          status: "error",
          errors: {
            videoA:
              !parseResp1.valid || !parseResp1.videoId
                ? (parseResp1.error ?? "Invalid video URL")
                : undefined,
            videoB:
              !parseResp2.valid || !parseResp2.videoId
                ? (parseResp2.error ?? "Invalid video URL")
                : undefined,
          },
        },
        { status: 400 },
      );
    }

    const videoAId = parseResp1.videoId;
    const videoBId = parseResp2.videoId;

    const [aMeta, aScript, bMeta, bScript] = await Promise.all([
      fetchMetaData(videoAId),
      fetchVideoTranscript(videoAId),
      fetchMetaData(videoBId),
      fetchVideoTranscript(videoBId),
    ]);

    const [aIngestion, bIngestion] = await Promise.all([
      aScript.status === "success"
        ? ingestTranscript(videoAId, aScript.data)
        : Promise.resolve(null),

      bScript.status === "success"
        ? ingestTranscript(videoBId, bScript.data)
        : Promise.resolve(null),
    ]);

    const videoA: AnalyzeVideoResult = {
      id: videoAId,
      status: "error",
      data: {},
      errors: {},
    };

    if (aMeta.status === "success") {
      videoA.data.metadata = aMeta.data;
    } else {
      videoA.errors.metadata = {
        status: aMeta.status,
        ...(aMeta.status === "api_error"
          ? { statusCode: aMeta.statusCode }
          : {}),
      };
    }

    if (aScript.status === "success") {
      videoA.data.transcript = aScript.data;
    } else {
      videoA.errors.transcript = {
        status: aScript.status,
        ...(aScript.status === "api_error"
          ? { statusCode: aScript.statusCode }
          : {}),
      };
    }
    const videoB: AnalyzeVideoResult = {
      id: videoBId,
      status: "error",
      data: {},
      errors: {},
    };

    if (bMeta.status === "success") {
      videoB.data.metadata = bMeta.data;
    } else {
      videoB.errors.metadata = {
        status: bMeta.status,
        ...(bMeta.status === "api_error"
          ? { statusCode: bMeta.statusCode }
          : {}),
      };
    }

    if (bScript.status === "success") {
      videoB.data.transcript = bScript.data;
    } else {
      videoB.errors.transcript = {
        status: bScript.status,
        ...(bScript.status === "api_error"
          ? { statusCode: bScript.statusCode }
          : {}),
      };
    }

    if (aIngestion) {
      videoA.ingestion = aIngestion;
    }

    if (bIngestion) {
      videoB.ingestion = bIngestion;
    }

    videoA.status = getVideoStatus(videoA);
    videoB.status = getVideoStatus(videoB);

    const overallStatus =
      videoA.status === "success" && videoB.status === "success"
        ? "success"
        : videoA.status === "error" && videoB.status === "error"
          ? "error"
          : "partial";

    return NextResponse.json(
      {
        status: overallStatus,
        videos: {
          videoA,
          videoB,
        },
      },
      {
        status:
          overallStatus === "success"
            ? 200
            : overallStatus === "partial"
              ? 207
              : 502,
      },
    );
  } catch (err) {
    console.error("Analyze video error:", err);

    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
};
