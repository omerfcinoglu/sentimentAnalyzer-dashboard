import { useCallback, useState } from "react";
import {
  fetchYoutubeVideoClient,
  fetchVideoComments,
  analyzeCommentsWithBackend,
} from "@/lib/youtube";
import type { YoutubeVideoData, CommentAnalysis } from "@/lib/youtube";

export type Phase = "idle" | "fetchComments" | "processComments";

type UseYoutubeAnalysisState = {
  loading: boolean;
  video: YoutubeVideoData | null;
  phase: Phase;
  progress: number;
  phaseCurrent: number;
  phaseTotal: number;
  analysisResult: CommentAnalysis | null;
  analysisError: string;
};

export function useYoutubeAnalysis(): UseYoutubeAnalysisState & {
  analyze: (url: string) => Promise<void>;
  resetError: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<YoutubeVideoData | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [phaseCurrent, setPhaseCurrent] = useState(0);
  const [phaseTotal, setPhaseTotal] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<CommentAnalysis | null>(
    null
  );
  const [analysisError, setAnalysisError] = useState("");

  const analyze = useCallback(async (url: string) => {
    setLoading(true);
    setVideo(null);
    setPhase("idle");
    setProgress(0);
    setPhaseCurrent(0);
    setPhaseTotal(0);
    setAnalysisResult(null);
    setAnalysisError("");

    try {
      const data = await fetchYoutubeVideoClient(url);
      setVideo(data);

      const totalComments = data.statistics.commentCount;

      setPhase("fetchComments");
      setPhaseCurrent(0);
      setPhaseTotal(totalComments);

      const comments = await fetchVideoComments(
        data.videoId,
        totalComments,
        (fetched) => {
          setPhase("fetchComments");
          setPhaseCurrent(fetched);
          setPhaseTotal(totalComments);
          const ratio = totalComments > 0 ? fetched / totalComments : 0;
          setProgress(Math.min(50, Math.round(ratio * 50)));
        },
        200
      );

      setPhase("processComments");
      setPhaseCurrent(0);
      setPhaseTotal(totalComments);

      const result = await analyzeCommentsWithBackend(comments, (processed) => {
        setPhase("processComments");
        setPhaseCurrent(processed);
        setPhaseTotal(totalComments);
        const ratio = comments.length > 0 ? processed / comments.length : 0;
        setProgress(50 + Math.round(ratio * 50));
      });

      setAnalysisResult(result);
      setProgress(100);
    } catch (e: any) {
      setAnalysisError(e.message || "Failed to analyze video.");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setAnalysisError("");
  }, []);

  return {
    loading,
    video,
    phase,
    progress,
    phaseCurrent,
    phaseTotal,
    analysisResult,
    analysisError,
    analyze,
    resetError,
  };
}
