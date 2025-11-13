import { eq, InferInsertModel } from "drizzle-orm";
import db from "src/db/db";
import { chat } from "src/db/schema";

type chatType = InferInsertModel<typeof chat>;

export const getAllChat = async () => {
  return await db.select().from(chat);
};

export const createChat = async (chatData: chatType) => {
  return await db.insert(chat).values(chatData).returning();
};

export const deleteChatById = async (id: string) => {
  return await db.delete(chat).where(eq(chat.id, id));
};
