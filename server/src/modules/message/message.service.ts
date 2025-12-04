import db from "../../db/db.js";
import { chat, message } from "../../db/schema/index.js";
import { queryDocument } from "../document/document.service.js";
import { eq } from "drizzle-orm";
import { HttpError } from "../../utils/http-error.util.js";

export const fetchMessageByChatId = async (chatId: string) => {
  return await db
    .select({
      id: message.id,
      prompt: message.prompt,
      response: message.response,
    })
    .from(message)
    .where(eq(message.chatId, chatId));
};

export const saveMessage = async (chatId: string, prompt: string) => {
  const chatRows = await db
    .select({
      documentId: chat.documentId,
      jobTitle: chat.jobTitle,
      jobDescription: chat.jobDescription,
    })
    .from(chat)
    .where(eq(chat.id, chatId));
  if (!chatRows) {
    throw new HttpError(400, "chatRow missing");
  }

  const { documentId, jobTitle, jobDescription } = chatRows[0];

  const rawResponse = await queryDocument(
    prompt,
    documentId,
    jobTitle,
    jobDescription,
  );

  const messageData = await db
    .insert(message)
    .values({ chatId, prompt, response: rawResponse })
    .returning();

  return messageData;
};
