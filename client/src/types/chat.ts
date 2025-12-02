export type ChatCreatePayload = {
  title: string;
  description: string;
  pdf: File;
  token: string | null;
};

export type Chat = {
  id: string;
  chatTitle: string;
}
  // userId: text("user_id").notNull(),
  //   documentId: uuid("document_id").notNull(),
  //   chatTitle: text("chat_title").notNull(),
  //   jobTitle: text("job_title").notNull(),
  //   jobDescription: text("job_description").notNull(),
  //   fileUrl: text("file_url").notNull(),
  //   scores: jsonb("scores"),