export type YoutubeVideoData = {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  embedUrl: string;
};

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      const parts = parsed.pathname.split("/");
      return parts[2] || null;
    }

    const parts = parsed.pathname.split("/");
    const last = parts[parts.length - 1];
    if (last) return last;

    return null;
  } catch {
    return null;
  }
}

export async function fetchYoutubeVideoClient(
  url: string
): Promise<YoutubeVideoData> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const apiKey = "imtired";
  if (!apiKey) {
    throw new Error("Missing YouTube API key");
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch video data");
  }

  const json = await res.json();
  const item = json.items?.[0];
  if (!item) {
    throw new Error("Video not found");
  }

  const snippet = item.snippet || {};
  const stats = item.statistics || {};
  const thumbnails = snippet.thumbnails || {};

  return {
    videoId,
    title: snippet.title || "",
    description: snippet.description || "",
    channelTitle: snippet.channelTitle || "",
    publishedAt: snippet.publishedAt || "",
    thumbnails: {
      default: thumbnails.default?.url,
      medium: thumbnails.medium?.url,
      high: thumbnails.high?.url,
    },
    statistics: {
      viewCount: Number(stats.viewCount || 0),
      likeCount: Number(stats.likeCount || 0),
      commentCount: Number(stats.commentCount || 0),
    },
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}
