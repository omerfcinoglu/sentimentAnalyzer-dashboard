import type { CommentAnalysis } from "@/lib/youtube"

type Props = {
    result: CommentAnalysis
}

export const AnalysisResult = ({ result }: Props) => {
    return (
        <div className="flex flex-col items-center w-full space-y-4">
            <h2 className="text-2xl font-semibold">Analysis completed</h2>
            <p className="text-lg text-muted-foreground">
                Processed comments: {result.totalComments}
            </p>
        </div>
    )
}
