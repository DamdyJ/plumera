import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    fileUrl: text("file_url").notNull(),
    extractedMarkdown: text("extracted_markdown"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_resumes_user_id").on(table.userId)],
).enableRLS();

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
