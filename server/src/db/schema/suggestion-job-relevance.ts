import { index, pgEnum, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { suggestions } from "./suggestion";
import { targetJobs } from "./target-job";

export const relevanceTypeEnum = pgEnum("relevance_type", [
  "strength",
  "improvement",
  "neutral",
]);

export const suggestionJobRelevance = pgTable(
  "suggestion_job_relevance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    suggestionId: uuid("suggestion_id")
      .notNull()
      .references(() => suggestions.id, { onDelete: "cascade" }),
    targetJobId: uuid("target_job_id")
      .notNull()
      .references(() => targetJobs.id, { onDelete: "cascade" }),
    relevanceType: relevanceTypeEnum("relevance_type").notNull(),
  },
  (table) => [
    uniqueIndex("unq_sjr_suggestion_target_job").on(
      table.suggestionId,
      table.targetJobId,
    ),
    index("idx_sjr_suggestion_id").on(table.suggestionId),
    index("idx_sjr_target_job_id").on(table.targetJobId),
  ],
).enableRLS();

export type SuggestionJobRelevance = typeof suggestionJobRelevance.$inferSelect;
export type NewSuggestionJobRelevance = typeof suggestionJobRelevance.$inferInsert;
