import type { YoutubeVideoData } from "@/lib/youtube"

type Props = {
    video: YoutubeVideoData
}

export function VideoPreview({ video }: Props) {
    return (
        <div className="flex flex-col items-center w-full space-y-4">
            <div className=" aspect-video w-full max-w-2xl overflow-hidden rounded-lg bg-black">
                <img className="w-full h-full object-cover" src={video.thumbnails.high || video.thumbnails.medium || video.thumbnails.default || ""} alt={video.title} />
            </div>

            <div className="space-y-3">
                <h2 className="text-2xl font-semibold">{video.title}</h2>
                <p className="text-xl text-muted-foreground">
                    {video.channelTitle} • {new Date(video.publishedAt).toLocaleDateString()}
                </p>
            </div>

            <div className="flex justify-center gap-4 text-xl text-muted-foreground">
                <span>Views: {video.statistics.viewCount.toLocaleString()}</span>
                <span>Likes: {video.statistics.likeCount.toLocaleString()}</span>
                <span>Comments: {video.statistics.commentCount.toLocaleString()}</span>
            </div>
        </div>
    )
}
