import z from "zod";

/**
 * Zod schema describing the expected scoring JSON structure.
 * Adjust the shape if your model returns different keys or types.
 */
export const scoringSchema = z.object({
  overallScore: z.number(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  keywordMatch: z.array(
    z.object({
      keyword: z.string(),
      found: z.boolean(),
    }),
  ),
  formattingFeedback: z.string(),
  languageAnalysis: z.string(),
});

/** Type inferred from schema */
export type ScoringResult = z.infer<typeof scoringSchema>;
