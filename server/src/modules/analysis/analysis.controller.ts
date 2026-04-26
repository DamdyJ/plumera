import type { RequestHandler } from "express";
import { sendNotImplemented } from "../../utils/not-implemented-response.util";

const analysisMessage = "Analysis API foundation is ready; LangGraph execution is implemented in Phase 2.";

export const enqueueAnalysis: RequestHandler = (_req, res) => {
  sendNotImplemented(res, analysisMessage);
};

export const listAnalysisRuns: RequestHandler = (_req, res) => {
  sendNotImplemented(res, analysisMessage);
};

export const listAnalysisSuggestions: RequestHandler = (_req, res) => {
  sendNotImplemented(res, analysisMessage);
};
