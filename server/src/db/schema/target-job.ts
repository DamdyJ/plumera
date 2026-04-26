import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { resumes } from "./resume";

export const targetJobs = pgTable(
  "target_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobTitle: text("job_title").notNull(),
    jobDescription: text("job_description").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_target_jobs_resume_id").on(table.resumeId)],
).enableRLS();

export type TargetJob = typeof targetJobs.$inferSelect;
export type NewTargetJob = typeof targetJobs.$inferInsert;
