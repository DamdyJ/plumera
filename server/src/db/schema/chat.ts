import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  pdfUrl: text("pdf_url").notNull(),
  scores: jsonb("scores").$type<{
    overall_score: number;
    category_scores: Record<
      string,
      {
        score: number;
        weight: number;
        feedback: string;
      }
    >;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});
