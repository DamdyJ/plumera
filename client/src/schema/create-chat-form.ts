import z from "zod";

export const createChatForm = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters.")
    .max(64, "Title must be at most 64 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(1500, "Description must be at most 1500 characters."),
  pdf: z
    .any()
    .refine((file) => file && file instanceof File, "File is required")
    .refine(
      (file) => !file || ["application/pdf"].includes(file.type),
      "Invalid file type",
    )
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "File must be less than 10MB",
    ),
});

