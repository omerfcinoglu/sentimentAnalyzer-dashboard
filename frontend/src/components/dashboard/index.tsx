import { useState } from "react"
import { isValidYoutubeUrl } from "@/lib/validators"
import { useYoutubeAnalysis } from "@/hooks/useYoutubeAnalysis"
import { AnalyzeForm } from "./AnalyzeForm"
import { VideoPreview } from "./VideoPreview"
import { AnalysingSpinner } from "./AnalysingSpinner"
import { AnalysisResult } from "./AnalysisResult"
import { motion, AnimatePresence } from "framer-motion"

export const Dashboard = () => {
    const [url, setUrl] = useState("")
    const [inputError, setInputError] = useState("")
    const {
        loading,
        video,
        phase,
        progress,
        phaseCurrent,
        phaseTotal,
        analysisResult,
        analysisError,
        analyze,
        resetError
    } = useYoutubeAnalysis()

    const hasContent = !!video || loading || !!analysisResult

    function handleSubmit() {
        if (!isValidYoutubeUrl(url)) {
            setInputError("Please enter a valid YouTube video URL.")
            return
        }
        setInputError("")
        resetError()
        analyze(url)
    }

    function handleUrlChange(value: string) {
        setUrl(value)
        if (inputError) setInputError("")
        if (analysisError) resetError()
    }

    function getPhaseLabel() {
        if (phase === "fetchComments") return "Fetching comments"
        if (phase === "processComments") return "Processing comments"
        return ""
    }

    const showErrorMessage = inputError || analysisError

    return (
        <div className="relative w-full min-h-screen bg-background px-4 py-8">
            <motion.div
                className="absolute left-1/2 w-full max-w-3xl -translate-x-1/2"
                initial={false}
                animate={
                    hasContent
                        ? { top: 32, y: 0 }
                        : { top: "50%", y: "-50%" }
                }
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
            >
                <div className="flex flex-col items-center gap-4">
                    <AnalyzeForm
                        value={url}
                        onChange={handleUrlChange}
                        onSubmit={handleSubmit}
                        loading={loading}
                        hasError={!!inputError}
                    />

                    {showErrorMessage && (
                        <p className="text-sm text-destructive mt-2">
                            {showErrorMessage}
                        </p>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {hasContent && (
                    <motion.div
                        key="analysis-section"
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 32 }}
                        transition={{ duration: 0.51, ease: "easeOut" }}
                        className="pt-52 flex flex-row gap-6 items-center"
                    >
                        {video && (
                            <motion.div
                                key="video-preview"
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="w-1/2"
                            >
                                <VideoPreview video={video} />
                            </motion.div>
                        )}

                        <div className="w-1/2 space-y-4">
                            <AnimatePresence mode="wait">
                                {loading && phase !== "idle" && (
                                    <motion.div
                                        key="spinner"
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 24 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <AnalysingSpinner
                                            phaseLabel={getPhaseLabel()}
                                            progress={progress}
                                            current={phaseCurrent}
                                            total={phaseTotal}
                                        />
                                    </motion.div>
                                )}

                                {!loading && analysisResult && (
                                    <motion.div
                                        key="analysis-result"
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 24 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <AnalysisResult result={analysisResult} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
