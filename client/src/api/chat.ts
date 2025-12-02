import axios from "axios";
import { api } from "@/lib/axios";
import type { ChatCreatePayload, Chat } from "@/types/chat";

export async function fetchChats(): Promise<Chat[]> {
  const response = await api.get(`/chats`);
  return response.data;
}

export async function fetchChat(id: string) {
  const response = await api.get(`/chats/${id}`);
  return response.data;
}

export async function createChat(payload: ChatCreatePayload) {
  const form = new FormData();
  form.append("jobTitle", payload.title);
  form.append("jobDescription", payload.description);
  form.append("pdf", payload.pdf);

  const response = await api.post("/chats", form);
  return response.data;
}

export async function deleteChat(id: string) {
  try {
    const response = await api.delete(`/chats/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
  }
}

export async function updateChatTitle(id: string, title: string) {
  const response = await api.put(`/chats/${id}`, { chatTitle: title });
  return response.data;
}
