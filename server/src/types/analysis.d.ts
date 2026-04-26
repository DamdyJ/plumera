export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export type SuggestionCategory = "structure" | "impact" | "grammar" | "tone";

export type SuggestionSeverity = "critical" | "moderate" | "minor";

export type SuggestionStatus = "pending" | "accepted" | "dismissed";

export type SuggestionRelevanceType = "strength" | "improvement" | "neutral";

export interface AnalysisQueuePayload {
  analysisRunId: string;
  resumeId: string;
  userId: string;
}

export interface TargetJobInput {
  jobTitle: string;
  jobDescription: string;
  sortOrder?: number;
}

export interface SuggestionJobRelevanceInput {
  targetJobId: string;
  relevanceType: SuggestionRelevanceType;
}

export interface SuggestionInput {
  category: SuggestionCategory;
  severity: SuggestionSeverity;
  originalText: string;
  suggestedText: string;
  explanation: string;
  jobRelevance: SuggestionJobRelevanceInput[];
}
