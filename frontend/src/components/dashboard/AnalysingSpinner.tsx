import { Progress } from "../ui/progress"
import { Spinner } from "../ui/spinner"

type AnalysingSpinnerProps = {
    phaseLabel: string
    progress: number
    current: number
    total: number
}

export const AnalysingSpinner = ({ phaseLabel, progress, current, total }: AnalysingSpinnerProps) => {
    return (
        <div className="flex flex-col justify-center w-full items-center">
            <div className="space-y-4 w-full max-w-md">
                <div className="flex flex-row gap-3 justify-center items-center">
                    <Spinner className="size-8" />
                    <h2 className="text-3xl font-semibold">{phaseLabel}</h2>
                </div>
                <p className="text-xl text-muted-foreground text-center">
                    {current} / {total || "?"}
                </p>
                <div className="space-y-1">
                    <Progress value={progress} />
                </div>
            </div>
        </div>
    )
}
