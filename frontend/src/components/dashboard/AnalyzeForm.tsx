import { Input } from "../ui/input"
import { Button } from "../ui/button"

type AnalyzeFormProps = {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    loading: boolean
    hasError: boolean
}

export const AnalyzeForm = ({
    value,
    onChange,
    onSubmit,
    loading,
    hasError
}: AnalyzeFormProps) => {
    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                    YouTube Comment Sentiment Dashboard
                </h1>
                <p className="text-sm text-muted-foreground max-w-xl">
                    Paste a YouTube video URL to fetch its comments and analyze their sentiment with your fine-tuned BERT model.
                </p>
            </div>

            <div className="flex flex-row gap-4 justify-center w-full max-w-xl">
                <Input
                    className="flex-1"
                    placeholder="Paste YouTube video link to analyze"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    aria-invalid={hasError}
                />
                <Button variant="default" onClick={onSubmit} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze"}
                </Button>
            </div>
        </div>
    )
}
