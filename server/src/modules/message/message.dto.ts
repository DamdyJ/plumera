import { z } from "zod";

export const createMessageSchema = z.object({
  prompt: z
    .string({ required_error: "Prompt is required" })
    .max(5000, "Prompt must be under 5000 characters"),
});

export type CreateMessageDTO = z.infer<typeof createMessageSchema>;
