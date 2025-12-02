import type z from "zod";
import type { createChatSchema } from "../validation";

export type CreateChatType = z.infer<typeof createChatSchema>;

export type CreateChatResponseType = {
  data: any;
  id: string;
  fileUrl: string;
};

export type GetChatResponseType = {
  id: string;
  userId: string;
  documentId: string;
  chatTitle: string;
  jobTitle: string;
  jobDescription: string;
  fileUrl: string;
  scores: unknown;
  createdAt: Date;
  updatedAt: Date;
};
