import { useState } from "react"
import type { CommentAnalysis } from "@/lib/youtube"
import { Button } from "../ui/button"
import { ArrowUpRight, Minus, ArrowDownRight } from "lucide-react"

type Props = {
    result: CommentAnalysis
}

export const AnalysisResult = ({ result }: Props) => {
    const [showComments, setShowComments] = useState(false)

    const total = result.totalComments || result.results.length || 0

    const positiveCount = result.results.filter(r => r.label === "Positive").length
    const neutralCount = result.results.filter(r => r.label === "Notr").length
    const negativeCount = result.results.filter(r => r.label === "Negative").length

    const positivePct = total > 0 ? (positiveCount / total) * 100 : 0
    const neutralPct = total > 0 ? (neutralCount / total) * 100 : 0
    const negativePct = total > 0 ? (negativeCount / total) * 100 : 0

    function formatScore(v: number) {
        return v.toFixed(2)
    }

    return (
        <div className="flex flex-col w-full gap-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Analysis summary</h2>
                <p className="text-sm text-muted-foreground">
                    Total comments processed: {total}
                </p>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                    {positivePct > 0 && (
                        <div
                            style={{ width: `${positivePct}%` }}
                            className="h-full bg-emerald-500"
                        />
                    )}
                    {neutralPct > 0 && (
                        <div
                            style={{ width: `${neutralPct}%` }}
                            className="h-full bg-slate-400"
                        />
                    )}
                    {negativePct > 0 && (
                        <div
                            style={{ width: `${negativePct}%` }}
                            className="h-full bg-red-500"
                        />
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                            <span className="font-medium">Positive</span>
                        </div>
                        <p className="text-muted-foreground">
                            {positiveCount} ({positivePct.toFixed(1)}%)
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full bg-slate-400" />
                            <span className="font-medium">Neutral</span>
                        </div>
                        <p className="text-muted-foreground">
                            {neutralCount} ({neutralPct.toFixed(1)}%)
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                            <span className="font-medium">Negative</span>
                        </div>
                        <p className="text-muted-foreground">
                            {negativeCount} ({negativePct.toFixed(1)}%)
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Comments</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComments(prev => !prev)}
                >
                    {showComments ? "Hide comments" : "Show comments"}
                </Button>
            </div>

            {showComments && (
                <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
                    {result.results.map((r, index) => (
                        <div
                            key={index}
                            className="rounded-md border bg-background p-3 text-sm space-y-2"
                        >
                            <p className="line-clamp-3">{r.text}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                    <span>Positive: {formatScore(r.scores.Positive)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Minus className="h-4 w-4 text-slate-400" />
                                    <span>Neutral: {formatScore(r.scores.Notr)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                                    <span>Negative: {formatScore(r.scores.Negative)}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {result.results.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No comments were analyzed for this video.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
