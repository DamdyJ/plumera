import { Request, Response } from "express";
import {
  savePdfToDatabase,
  storeEmbeddingDocument,
} from "src/service/pdf.service";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "src/lib/asyncHandler";
import { HttpError } from "src/lib/httpError";
import { createChat } from "src/service/chat.service";
import { gemini } from "src/lib/gemini";
import { jobDesc } from "src/types/jobDecs";

interface CategoryScore {
  score: number;
  weight: number;
  feedback: string;
}

interface Scores {
  overall_score: number;
  category_scores: Record<string, CategoryScore>;
  action_items: string[];
}

// get all chat
// export const index = asyncHandler(async (req: Request, res: Response) => {
//   return res.status(200).json({});
// });

// get chay by id
// export const show = asyncHandler(async (req: Request, res: Response) => {
//   return res.status(200).json({});
// });

// create new chat
export const create = asyncHandler(async (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth.userId) throw new HttpError(401, "Unauthorize user");

  const file = req.file;
  if (!file) throw new HttpError(400, "Invalid file");

  const savedPdf = await savePdfToDatabase(file);
  if (!savedPdf) throw new HttpError(500, "Failed to save pdf!");

  const savedEmbedding = await storeEmbeddingDocument(savedPdf.fullPath);
  const relevantDocs = await savedEmbedding.similaritySearch(jobDesc, 5);
  const resumeContext = relevantDocs.map((doc) => doc.pageContent).join("\n");

  const structuredLLM = gemini.withStructuredOutput({
    name: "ResumeScore",
    schema: {
      type: "object",
      properties: {
        overall_score: { type: "number" },
        category_scores: {
          type: "object",
          properties: {
            relevance: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
            skills: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
            experience: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
            achievements: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
            formatting: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
            clarity: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
            ats: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
            education: {
              type: "object",
              properties: {
                score: { type: "number" },
                weight: { type: "number" },
                feedback: { type: "string" },
              },
            },
          },
        },
        action_items: { type: "array", items: { type: "string" } },
      },
    },
  });

  const rawResult = await structuredLLM.invoke([
    {
      role: "system",
      content: "You are a resume scoring expert.",
    },
    {
      role: "user",
      content: `Score this resume against job: ${jobDesc}\n\nResume:\n${resumeContext}`,
    },
  ]);
  const scoreResult = rawResult as Scores;
  const result = await createChat({
    pdfUrl: savedPdf.fullPath,
    userId: auth.userId,
    scores: scoreResult,
  });
  return res
    .status(200)
    .json({ success: true, data: result, traceId: res.locals.traceId });
});

// update chat by id
// export const update = asyncHandler(async (req: Request, res: Response) => {
//   return res.status(200).json({});
// });

// delete chat by id
// export const destroy = asyncHandler(async (req: Request, res: Response) => {
//   return res.status(200).json({});
// });
