import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { isValidYoutubeUrl } from "@/lib/validators"
import {
    fetchYoutubeVideoClient,
    fetchVideoComments,
    processCommentsWithModel
} from "@/lib/youtube"
import type { YoutubeVideoData, CommentAnalysis } from "@/lib/youtube"
import { VideoPreview } from "./VideoPreview"
import { AnalysingSpinner } from "./AnalysingSpinner"
import { AnalysisResult } from "./AnalysisResult"

type Phase = "idle" | "fetchComments" | "processComments"

export const Dashboard = () => {
    const [value, setValue] = useState("")
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [video, setVideo] = useState<YoutubeVideoData | null>(null)
    const [phase, setPhase] = useState<Phase>("idle")
    const [progress, setProgress] = useState(0)
    const [phaseCurrent, setPhaseCurrent] = useState(0)
    const [phaseTotal, setPhaseTotal] = useState(0)
    const [analysisResult, setAnalysisResult] = useState<CommentAnalysis | null>(null)

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
        setPhase("idle")
        setProgress(0)
        setPhaseCurrent(0)
        setPhaseTotal(0)
        setAnalysisResult(null)

        try {
            const data = await fetchYoutubeVideoClient(value)
            setVideo(data)

            const totalComments = data.statistics.commentCount

            setPhase("fetchComments")
            setPhaseCurrent(0)
            setPhaseTotal(totalComments)

            const comments = await fetchVideoComments(data.videoId, totalComments, fetched => {
                setPhase("fetchComments")
                setPhaseCurrent(fetched)
                setPhaseTotal(totalComments)
                const ratio = totalComments > 0 ? fetched / totalComments : 0
                setProgress(Math.min(50, Math.round(ratio * 50)))
            })

            setPhase("processComments")
            setPhaseCurrent(0)
            setPhaseTotal(comments.length)

            const result = await processCommentsWithModel(comments, processed => {
                setPhase("processComments")
                setPhaseCurrent(processed)
                setPhaseTotal(comments.length)
                const ratio = comments.length > 0 ? processed / comments.length : 0
                setProgress(50 + Math.round(ratio * 50))
            })

            setAnalysisResult(result)
            setProgress(100)
        } catch (e: any) {
            setError(true)
            setErrorMessage(e.message || "Failed to analyze video.")
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

    function getPhaseLabel() {
        if (phase === "fetchComments") return "Fetching comments"
        if (phase === "processComments") return "Processing comments"
        return ""
    }

    return (
        <div className="flex flex-col gap-6 p-4 w-full">
            <div className="flex flex-row gap-4 justify-center">
                <Input
                    className="max-w-lg"
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

            <div className="flex flex-row gap-4 items-center">
                {video && (
                    <div className="w-1/2">
                        <VideoPreview video={video} />
                    </div>
                )}

                <div className="w-1/2">
                    {loading && phase !== "idle" && (
                        <AnalysingSpinner
                            phaseLabel={getPhaseLabel()}
                            progress={progress}
                            current={phaseCurrent}
                            total={phaseTotal}
                        />
                    )}

                    {!loading && analysisResult && (
                        <AnalysisResult result={analysisResult} />
                    )}
                </div>
            </div>
        </div>
    )
}
