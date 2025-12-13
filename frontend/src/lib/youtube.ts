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

export type YoutubeComment = {
  id: string;
  text: string;
  author: string;
};

export type SentimentScores = {
  Positive: number;
  Notr: number;
  Negative: number;
};

export type CommentSentiment = {
  text: string;
  label_id: number;
  label: string;
  scores: SentimentScores;
};

export type CommentAnalysis = {
  totalComments: number;
  results: CommentSentiment[];
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

const API_KEY = "AIzaSyAuP0Ojx4RhMY31gc44bwxcZ4skrx12cSY";
const BACKEND_URL = "http://127.0.0.1:8000/predict-batch";

export async function fetchYoutubeVideoClient(
  url: string
): Promise<YoutubeVideoData> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  if (!API_KEY) {
    throw new Error("Missing YouTube API key");
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`
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

export async function fetchVideoComments(
  videoId: string,
  totalExpected: number,
  onProgress: (fetched: number) => void,
  delayMs: number = 200
): Promise<YoutubeComment[]> {
  if (!API_KEY) {
    throw new Error("Missing YouTube API key");
  }

  const comments: YoutubeComment[] = [];
  let pageToken: string | undefined = undefined;
  let fetched = 0;

  while (true) {
    const url = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("videoId", videoId);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error("Failed to fetch comments");
    }

    const json = await res.json();
    const items = json.items || [];

    for (const item of items) {
      const snippet = item.snippet?.topLevelComment?.snippet;
      if (!snippet) continue;
      comments.push({
        id: item.id,
        text: snippet.textDisplay || "",
        author: snippet.authorDisplayName || "",
      });
    }

    fetched = comments.length;
    onProgress(fetched);

    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return comments;
}

export async function processCommentsWithModel(
  comments: YoutubeComment[],
  onProgress: (processed: number) => void
): Promise<CommentAnalysis> {
  let processed = 0;
  const total = comments.length;
  if (total === 0) {
    onProgress(0);
    return { totalComments: 0 };
  }

  for (const c of comments) {
    console.log(c);
    processed += 1;
    if (processed === total || processed % 10 === 0) {
      onProgress(processed);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { totalComments: total, results: [] };
}

export async function analyzeCommentsWithBackend(
  comments: YoutubeComment[],
  onProgress: (processed: number) => void
): Promise<CommentAnalysis> {
  const texts = comments.map((c) => c.text);
  const batchSize = 32;
  const results: CommentSentiment[] = [];
  let processed = 0;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts: batch }),
    });

    if (!res.ok) {
      throw new Error("Failed to get predictions from backend");
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Unexpected backend response");
    }

    for (const r of data.results) {
      results.push({
        text: r.text,
        label_id: r.label_id,
        label: r.label,
        scores: {
          Positive: r.scores.Positive,
          Notr: r.scores.Notr,
          Negative: r.scores.Negative,
        },
      });
    }

    processed += batch.length;
    onProgress(processed);
  }

  return {
    totalComments: comments.length,
    results,
  };
}
