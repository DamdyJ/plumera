import z from "zod";

export const createChatForm = z.object({
  jobTitle: z
    .string("Job title is required")
    .min(2, "Title must be at least 2 characters.")
    .max(64, "Title must be at most 64 characters."),
  jobDescription: z
    .string("Job description is required")
    .min(10, "Description must be at least 10 characters.")
    .max(5000, "Description must be at most 5000 characters."),
  pdf: z
    .instanceof(File, { message: "Resume PDF is required" })
    .refine(
      (file) => file.type === "application/pdf",
      "Invalid file type. Please upload a PDF.",
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File must be less than 10MB",
    ),
});
