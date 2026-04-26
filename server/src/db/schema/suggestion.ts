import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { analysisRuns } from "./analysis-run";

export const suggestionCategoryEnum = pgEnum("suggestion_category", [
  "structure",
  "impact",
  "grammar",
  "tone",
]);

export const suggestionSeverityEnum = pgEnum("suggestion_severity", [
  "critical",
  "moderate",
  "minor",
]);

export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "pending",
  "accepted",
  "dismissed",
]);

export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    analysisRunId: uuid("analysis_run_id")
      .notNull()
      .references(() => analysisRuns.id, { onDelete: "cascade" }),
    category: suggestionCategoryEnum("category").notNull(),
    severity: suggestionSeverityEnum("severity").notNull(),
    originalText: text("original_text").notNull(),
    suggestedText: text("suggested_text").notNull(),
    explanation: text("explanation").notNull(),
    status: suggestionStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_suggestions_run_id").on(table.analysisRunId)],
).enableRLS();

export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;
