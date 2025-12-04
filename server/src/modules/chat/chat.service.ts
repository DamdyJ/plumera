import { eq, desc, and } from "drizzle-orm";
import db from "../../db/db.js";
import { chat } from "../../db/schema/index.js";
import { CreateChatDTO } from "./chat.dto.js";
import { savePdf, storeEmbedding } from "../document/document.service.js";
import { sanitizeFilename } from "../../utils/sanitize-filename.util.js";

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
  const pdf = await savePdf(file);
  const chatTitle = sanitizeFilename(file.originalname);

  const embeddingResult = await storeEmbedding(pdf.fullPath);
  const documentId = embeddingResult.documentId;

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

export const updateChatTitleById = async (id: string, chatTitle: string) => {
  return await db
    .update(chat)
    .set({ chatTitle })
    .where(eq(chat.id, id))
    .returning({ id: chat.id, chatTitle: chat.chatTitle });
};
