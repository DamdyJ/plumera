import { AxiosError } from "axios";
import { api } from "../lib/axios";
import type { ApiErrorResponse } from "@/types/chat-api";

export async function createMessage(prompt: string, chatId: string) {
  try {
    const response = await api.post(
      `/api/chats/${chatId}/messages`,
      { prompt },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorResponse | undefined;
      if (Array.isArray(data?.details)) {
        data.details.forEach((d) => console.error(d.path, d.message));
      }
      throw new Error(data?.message ?? error.message);
    }
    throw error;
  }
}

export async function getMessageByChatId(chatId: string) {
  const response = await api.get(`/api/chats/${chatId}/messages`);
  console.debug("POST createMessage response.data =", response.data);
  return response.data.data;
}
