import axios from "axios";
import { api } from "@/lib/axios";

export async function createMessage(prompt: string, chatId: string) {
  try {
    const response = await api.post(`/api/chats/${chatId}/messages`, {
      prompt,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
  }
}
type MessageResponse = {
  id: string;
  prompt: string;
  response: string;
};
export async function getMessageByChatId(
  chatId: string,
): Promise<MessageResponse[]> {
  const response = await api.get(`/api/chats/${chatId}/messages`);
  return response.data.data;
}
