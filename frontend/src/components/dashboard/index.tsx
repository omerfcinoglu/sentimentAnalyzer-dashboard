import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { isValidYoutubeUrl } from "@/lib/validators"
import { fetchYoutubeVideoClient } from "@/lib/youtube"
import type { YoutubeVideoData } from "@/lib/youtube"
import { VideoPreview } from "./VideoPreview"

export const Dashboard = () => {
    const [value, setValue] = useState("")
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [video, setVideo] = useState<YoutubeVideoData | null>(null)

    async function handleAnalyze() {
        if (!isValidYoutubeUrl(value)) {
            setError(true)
            setErrorMessage("Please enter a valid YouTube video URL.")
            return
        }

        setError(false)
        setErrorMessage("")
        setLoading(true)
        setVideo(null)

        try {
            const data = await fetchYoutubeVideoClient(value)
            setVideo(data)
        } catch (e: any) {
            setError(true)
            setErrorMessage(e.message || "Failed to fetch video data.")
        } finally {
            setLoading(false)
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value
        setValue(val)
        if (error) {
            setError(false)
            setErrorMessage("")
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4 w-full max-w-2xl ">
            <div className="flex flex-row gap-4">
                <Input
                    placeholder="paste youtube video link to analyze"
                    value={value}
                    onChange={handleInputChange}
                    aria-invalid={error}
                />
                <Button variant="default" onClick={handleAnalyze} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze"}
                </Button>
            </div>

            {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            {video && (
                <VideoPreview video={video} />
            )}
        </div>
    )
}
