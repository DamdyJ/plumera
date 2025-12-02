import { z } from "zod";

export const createChatSchema = z.object({
  jobTitle: z
    .string({ required_error: "Job title is required" })
    .min(2, "Job title must be at least 2 characters")
    .max(64, "Job title must be under 64 characters"),
  jobDescription: z
    .string({ required_error: "Job description is required" })
    .min(10, "Job description must be at least 10 characters")
    .max(5000, "Job description must be under 5000 characters"),
});

export type CreateChatDTO = z.infer<typeof createChatSchema>;

export const updateChatSchema = z.object({
  chatTitle: z
    .string({ required_error: "Chat title is required" })
    .max(64, "Chat title must be under 64 characters")
    .nonempty(),
});
