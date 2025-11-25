import { eq, desc, and } from "drizzle-orm";
import db from "src/db/db";
import { chat } from "src/db/schema";
import { CreateChatDTO } from "./chat.dto";
import { savePdf, storeEmbedding } from "../document/document.service";
import { sanitizeFilename } from "src/utils/sanitize-filename.util";

export const findChatsByUserId = async (userId: string) => {
  return await db
    .select({ id: chat.id, chatTitle: chat.chatTitle })
    .from(chat)
    .where(eq(chat.userId, userId))
    .orderBy(desc(chat.updatedAt));
};

export const findChatById = async (id: string, userId?: string) => {
  const conditions = userId
    ? and(eq(chat.id, id), eq(chat.userId, userId))
    : eq(chat.id, id);

  const result = await db.select().from(chat).where(conditions);

  if (result.length === 0) {
    return null;
  }

  return result[0];
};

export const saveChat = async (
  userId: string,
  file: Express.Multer.File,
  dto: CreateChatDTO,
) => {
  // Step 1: Upload PDF to storage
  const pdf = await savePdf(file);
  const chatTitle = sanitizeFilename(file.originalname);

  // Step 2: Create embeddings (this is the most time-consuming operation)
  // Note: If this fails, the PDF will remain in storage but won't be referenced
  // Consider implementing cleanup logic in the future
  const embeddingResult = await storeEmbedding(pdf.fullPath);
  const documentId = embeddingResult.documentId;

  // Step 3: Save to database
  const data = await db
    .insert(chat)
    .values({
      documentId,
      userId,
      chatTitle,
      fileUrl: pdf.fullPath,
      jobTitle: dto.jobTitle,
      jobDescription: dto.jobDescription,
    })
    .returning({ id: chat.id, fileUrl: chat.fileUrl });

  return data[0];
};

export const removeChatById = async (id: string) => {
  return await db.delete(chat).where(eq(chat.id, id));
};
