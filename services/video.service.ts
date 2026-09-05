interface Result {
  valid: boolean;
  error?: string;
  videoId?: string | null;
}

// https://www.youtube.com/watch?v=ABC123
// │      │                │      │
// │      │                │      └── search
// │      │                └───────── pathname
// │      └────────────────────────── hostname
// └───────────────────────────────── protocol

export const parseVideoUrl = (url: string): Result => {
  let valid: boolean = false;
  let videoId: string | null = null;
  let error: string = "";
  try {
    const parsedUrl = new URL(url);
    const hostName = parsedUrl.hostname.replace("www.", "");
    const path = parsedUrl.pathname;

    if (hostName === "youtube.com") {
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
	
    valid = true;
    return {
      valid,
      videoId,
    };
  } catch (error) {
    console.log(error);
    return {
      valid: false,
      videoId: null,
      error: "Invalid URL format",
    };
  }
};
