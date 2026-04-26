import { Router } from "express";
import {
  enqueueAnalysis,
  listAnalysisRuns,
  listAnalysisSuggestions,
} from "./analysis.controller";

export const AnalysisRouter = Router({ mergeParams: true });

AnalysisRouter.post("/:resumeId/analyze", enqueueAnalysis);
AnalysisRouter.get("/:resumeId/analyses", listAnalysisRuns);
AnalysisRouter.get(
  "/:resumeId/analyses/:analysisRunId/suggestions",
  listAnalysisSuggestions,
);
