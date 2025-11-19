import { AxiosError } from "axios";
import { api } from "../lib/axios";
import type { ChatCreatePayload, ApiErrorResponse } from "@/types/chat-api";

export async function createChat(payload: ChatCreatePayload) {
  const { token } = payload;
  if (!token) {
    throw new Error("Token is required");
  }
  const form = new FormData();
  form.append("title", payload.title);
  form.append("description", payload.description);
  form.append("pdf", payload.pdf);

  try {
    const response = await api.post("/api/chat", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
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
