import { z } from "zod";

export const createChatDTO = z.object({
  title: z
    .string({ required_error: "title is required" })
    .min(2, "title must be at least 2 characters")
    .max(64, "title must be under 64 characters"),

  description: z
    .string({ required_error: "description is required" })
    .min(10, "description must be at least 10 characters")
    .max(1500, "description too long"),
});

export type createChatType = z.infer<typeof createChatDTO>;
