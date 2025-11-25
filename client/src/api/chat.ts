import { AxiosError } from "axios";
import { api } from "../lib/axios";
import type { ChatCreatePayload, ApiErrorResponse } from "@/types/chat-api";

export async function createChat(payload: ChatCreatePayload) {
  const form = new FormData();
  form.append("jobTitle", payload.title);
  form.append("jobDescription", payload.description);
  form.append("pdf", payload.pdf);
  try {
    const response = await api.post("/api/chats", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

export async function getChatById(id: string) {
  const response = await api.get(`/api/chats/${id}`);
  return response.data;
}

export async function getChatByUserId() {
  const response = await api.get(`/api/chats`);
  return response.data;
}
