import {
  index,
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { message } from "./message.js";

export const chat = pgTable(
  "chat",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    documentId: uuid("document_id").notNull(),
    chatTitle: text("chat_title").notNull(),
    jobTitle: text("job_title").notNull(),
    jobDescription: text("job_description").notNull(),
    fileUrl: text("file_url").notNull(),
    scores: jsonb("scores"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("chat_title_idx").on(table.chatTitle),
    index("chat_user_id_idx").on(table.userId),
  ],
);

export const chatRelations = relations(chat, ({ many }) => ({
  message: many(message),
}));
