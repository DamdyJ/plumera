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
import jsonCleanup from "src/lib/jsonCleanup";

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

  // const jobDesc = req.body as string;
  // if (!jobDesc) throw new HttpError(400, "Job Desc is required!");
  const jobDesc = `Qualifications

Requirements

Strong knowledge in Javascript

Strong knowledge in ReactJS concepts along with its popular accompanying libraries such as Redux, thunk, axios etc

Strong knowledge in HTML+CSS especially with general web interactivity

Understand how to construct a clean & efficient codebase within a React project

Experience in using testing framework such as Jest, Mocha, @testing-library/react, enzyme is a big plus

Excellent in working within a team, with good communication skills

Knowledge in version control tools (git, mercurial) is a big plus

Knowledge in using Storybook is a big plus

Knowledge in using NextJS is a big plus

`;
  const file = req.file;
  if (!file) throw new HttpError(400, "Invalid file");
  if (!file.mimetype?.includes("pdf"))
    throw new HttpError(400, "Only PDFs allowed");
  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) throw new HttpError(413, "File too large");

  const savedPdf = await savePdfToDatabase(file);

  const fullPath = process.env.SUPABASE_STORAGE_URL + savedPdf.fullPath;
  const savedEmbedding = await storeEmbeddingDocument(fullPath);

  const relevantDocs = await savedEmbedding.similaritySearch(jobDesc, 5);

  const resumeContext = relevantDocs.map((doc) => doc.pageContent).join("\n");

  const prompt = `
  You are a resume scoring expert. Evaluate the resume against the provided Job Description. Return ONLY a valid JSON object matching this TypeScript type:
  Return ONLY a valid JSON object matching this TypeScript type:
  {
    overall_score: number,   // weighted 0-100 integer
    category_scores: {
      relevance: { score: number, weight: 25, feedback: string },
      skills: { score: number, weight: 20, feedback: string },
      experience: { score: number, weight: 20, feedback: string },
      achievements: { score: number, weight: 15, feedback: string },
      formatting: { score: number, weight: 8, feedback: string },
      clarity: { score: number, weight: 7, feedback: string },
      ats: { score: number, weight: 5, feedback: string },
      education: { score: number, weight: 5, feedback: string }
    },
    action_items: string[] // up to 3 items, 1 sentence each, concise
  }
  Do NOT include markdown or code fences.
  
  STRICT RULES:
  1) All feedback and action_items MUST be in English.
  2) Each category score and overall_score must be an integer between 0 and 100.
  3) overall_score must be computed as the weighted average of category scores using the weights above, rounded to the nearest integer.
  4) feedback strings: max 25 words; include up to 1–3 keywords from the Job Description that are present (comma-separated) OR 'none found'.
  5) action_items: at most 3 items; each item MUST be a single sentence, imperative tone, max 15 words.
  6) No markdown, no code fences, no extra keys. If unable to comply produce {"error":"reason"}.
  `;
  const response = await gemini.invoke([
    {
      role: "system",
      content:
        "You are an expert resume reviewer with HR experience and knowledge of applicant tracking systems (ATS). Act like a senior recruiter who also understands how AI/ATS parse resumes. Be terse, objective, and evidence-based. Always return only JSON matching the requested schema. Never include any extra text, markdown, or explanation. If you cannot answer, return an object with a clear error field instead of prose.",
    },
    {
      role: "user",
      content: prompt + `\n\nJob: ${jobDesc}\n\nResume:\n${resumeContext}`,
    },
  ]);

  if (!response) throw new HttpError(500, "Failed to get gemini ai response");

  let responseText: string;

  if (typeof response.content === "string") {
    responseText = response.content;
  } else if (Array.isArray(response.content)) {
    responseText = response.content
      .map((part) =>
        typeof part === "object" && "text" in part ? part.text : "",
      )
      .join("\n");
  } else {
    throw new HttpError(500, "AI response content is in an unhandled format.");
  }

  // const jsonScore = (await JSON.parse(responseText)) as Scores;
  const jsonScore = jsonCleanup(responseText);
  console.log(jsonScore);
  const result = await createChat({
    pdfUrl: fullPath,
    userId: auth.userId,
    scores: jsonScore,
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
