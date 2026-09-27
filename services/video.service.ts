import { urlParseResult } from "./types";

// https://www.youtube.com/watch?v=ABC123
// │      │                │      │
// │      │                │      └── search
// │      │                └───────── pathname
// │      └────────────────────────── hostname
// └───────────────────────────────── protocol

export const validateVideoId = (input: string): boolean => {
  if (!input) return false;

  const rawIdRegex = /^[A-Za-z0-9_-]{11}$/;
  if (rawIdRegex.test(input)) return true;

  return false;
};

export const parseVideoUrl = (url: string): urlParseResult => {
  let valid: boolean = false;
  let videoId: string | null = null;
  let error: string = "";
  try {
    const parsedUrl = new URL(url);
    const hostName = parsedUrl.hostname.replace("www.", "");
    const path = parsedUrl.pathname;

    if (hostName === "youtube.com" || hostName === "m.youtube.com") {
      if (path === "/watch") {
        const id = parsedUrl.searchParams.get("v")?.trim() || null;
        videoId = id;
      }

      if (path.startsWith("/embed/") || path.startsWith("/shorts/")) {
        const sp = path.split("/");
        videoId = sp[2]?.trim() || null;
      }
    }

    if (hostName === "youtu.be") {
      const sp = path.split("/");
      videoId = sp[1]?.trim() || null;
    }

    if (videoId === "" || videoId === null) {
      error = "URL is not correct";
      return {
        valid,
        videoId,
        error,
      };
    }

    if(!validateVideoId(videoId)) {
      error = "video Id is not valid";
      return {
        valid: false,
        videoId,
        error
      }
    }

    valid = true;
    return {
      valid,
      videoId,
    };
  } catch (err) {
    console.log(err);
    return {
      valid: false,
      videoId: null,
      error: "Invalid URL format",
    };
  }
};
