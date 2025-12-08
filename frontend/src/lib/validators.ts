export function isValidYoutubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // accepted domains
    const validHosts = ["www.youtube.com", "youtube.com", "youtu.be"];
    if (!validHosts.includes(parsed.hostname)) return false;

    // youtu.be/<id>
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.length > 1;
    }

    // youtube.com/watch?v=<id>
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v") !== null;
    }

    // youtube.com/shorts/<id>
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2]?.length > 0;
    }

    return false;
  } catch {
    return false;
  }
}
