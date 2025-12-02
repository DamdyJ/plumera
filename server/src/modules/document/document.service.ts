import { supabase } from "src/lib/supabase.client";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HttpError } from "src/utils/http-error.util";
import { cachedEmbeddings, gemini } from "src/lib/gemini.client";
import { pineconeIndex } from "src/lib/pinecone.client";
import { sanitizeFilename } from "src/utils/sanitize-filename.util";
import { v4 as uuidv4 } from "uuid";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Save PDF file to Supabase storage
 */
export const savePdf = async (file: Express.Multer.File) => {
  const bucket = process.env.BUCKET_NAME!;
  const uniqueFilename = sanitizeFilename(file.originalname);
  const filePath = `uploads/${uniqueFilename}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new HttpError(
      500,
      `Supabase upload failed: ${error.message ?? error}`,
    );
  }

  if (!data) {
    throw new HttpError(500, "Supabase returned no data");
  }

  return data;
};

/**
 * Store document embeddings in Pinecone vector database
 */
export const storeEmbedding = async (url: string) => {
  const documentId = uuidv4();
  const response = await fetch(process.env.STORAGE_URL + url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Failed to fetch PDF: ${response.statusText}`,
    );
  }
  const blob = await response.blob();

  if (!blob || blob.size === 0) {
    throw new HttpError(400, "Downloaded file is empty");
  }

  const loader = new WebPDFLoader(blob);
  const docs = await loader.load();

  if (!docs || docs.length === 0) {
    throw new HttpError(
      400,
      "PDF contains no extractable text. Please ensure the PDF is not password-protected, scanned without OCR, or corrupted. Try converting it to a standard text-based PDF.",
    );
  }

  const validDocs = docs.filter((d) => d.pageContent?.trim().length > 0);
  if (validDocs.length === 0) {
    throw new HttpError(
      400,
      "PDF has no readable text content on any page. Please check the file.",
    );
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);
  const docsWithMetadata = splitDocs.map((doc, index) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      documentId,
      chunkIndex: index,
      timestamp: new Date().toISOString(),
    },
  }));

  const result = await PineconeStore.fromDocuments(
    docsWithMetadata,
    cachedEmbeddings,
    {
      pineconeIndex,
      maxConcurrency: 5,
    },
  );

  if (!result) {
    throw new HttpError(500, "Failed to store documents in Pinecone");
  }

  return { result, documentId };
};

/**
 * Query documents using RAG (Retrieval Augmented Generation)
 */
export const queryDocument = async (
  question: string,
  documentId: string,
  jobTitle: string,
  jobDescription: string,
  limit: number = 5,
) => {
  const vectorStore = new PineconeStore(cachedEmbeddings, {
    pineconeIndex,
    textKey: "text",
  });

  const task = detectTask(question);
  const needsContext = shouldUseContext(question);

  let resumeContent = "";
  let resumeQuality: "unrelated" | "valid" | "partial" = "valid";

  if (needsContext) {
    const docs = await vectorStore.similaritySearch(question, limit, {
      documentId,
    });

    if (docs.length > 0) {
      resumeQuality = validateResumeContent(docs);
      resumeContent = docs.map((doc) => doc.pageContent).join("\n\n---\n\n");
    } else {
      resumeQuality = "unrelated";
    }
  }

  // NEW: Build TWO separate sections with clear labels
  const systemPrompt = buildSeparatedContextPrompt(
    task,
    jobTitle,
    jobDescription,
    resumeQuality,
  );

  // NEW: Use template with explicit sections
  const userMessage = buildSeparatedUserMessage(
    question,
    jobDescription,
    resumeContent,
  );

  const chain = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["user", userMessage],
  ])
    .pipe(gemini)
    .pipe(new StringOutputParser());

  const response = await chain.invoke({});

  return formatResponseAsMarkdown(response);
};

// NEW: Build system prompt that explains context separation
const buildSeparatedContextPrompt = (
  task: string,
  jobTitle: string,
  jobDescription: string,
  resumeQuality: "unrelated" | "valid" | "partial",
): string => {
  const baseRole = `You are Plumera, an expert resume coach and recruiter.

**YOUR ROLE:**
- Analyze resumes for a specific job target
- Compare candidate skills to job requirements
- Provide actionable improvement advice

**CRITICAL INSTRUCTION - CONTEXT SEPARATION:**
The user will provide you with THREE SEPARATE PIECES OF INFORMATION:
1. **JOB DESCRIPTION** - What the employer is looking for (marked with "=== JOB DESCRIPTION ===")
2. **CANDIDATE RESUME** - What the candidate has (marked with "=== CANDIDATE RESUME ===")
3. **USER QUESTION** - What they want to know (marked with "=== QUESTION ===")

**YOU MUST NOT BLEND THESE:**
- Do NOT say "You have [job requirement]" when talking about the job
- Do NOT say "The job requires [resume skill]" when talking about the resume
- Always be CLEAR which is which: "The job requires X. You have Y. Here's the gap..."

**TONE & LANGUAGE:**
- Use "you" for the candidate, "the role" for the job
- No greetings like "Hi there!" or "I'd be happy to help..."
- Jump straight to the answer
- Format as clean markdown with bold, headers, and lists`;

  if (resumeQuality === "unrelated") {
    return `${baseRole}

**ISSUE:** The uploaded file is not a resume. 
Response: Politely tell them to upload a valid resume/CV file.`;
  }

  if (resumeQuality === "partial") {
    return `${baseRole}

**ISSUE:** The resume is incomplete. Acknowledge this but work with what's available.`;
  }

  const taskInstructions: Record<string, string> = {
    SUMMARIZE: `**YOUR TASK: SUMMARIZE THE RESUME**
- Write 2-3 paragraphs about what the candidate brings
- Focus on relevance to the "${jobTitle}" role
- Do NOT mention job requirements here - only summarize candidate background
- Start with: Background → Key strengths → Fit potential`,

    IMPROVE: `**YOUR TASK: SUGGEST RESUME IMPROVEMENTS**
- Compare candidate's resume against the job requirements
- Give 3-5 specific changes: "Change X to Y because Z"
- Clearly separate: "Job needs this. You have that. Here's the gap."
- Include example rewrites
- Prioritize by impact`,

    JOB_FIT: `**YOUR TASK: ASSESS CANDIDATE vs JOB MATCH**
- Compare candidate skills (from RESUME) to job needs (from JOB DESCRIPTION)
- Rate each area: "Strong match" / "Partial match" / "Gap"
- Be explicit: "Job requires: X. Candidate has: Y. Assessment: Z"
- For gaps, explain criticality and how to address`,

    GAP_ANALYSIS: `**YOUR TASK: IDENTIFY MISSING SKILLS**
- List specific skills/experience in the job that are missing from resume
- Format: "Job needs X. You don't have it. Here's why it matters."
- Suggest how to address each gap
- Prioritize by importance to the role`,

    TAILOR: `**YOUR TASK: TAILOR RESUME FOR THIS JOB**
- Rewrite resume sections to match job language/keywords
- Use phrases from the job description
- Keep facts from resume accurate - just reframe them
- Separate: "Job emphasizes X. You can highlight Y by..."`,

    GENERAL_ADVICE: `**YOUR TASK: ANSWER THE QUESTION**
- Reference both job requirements and candidate background when relevant
- But keep them separate in your explanation
- Be specific with examples from their resume and the job`,
  };

  return `${baseRole}

${taskInstructions[task] || taskInstructions["GENERAL_ADVICE"]}`;
};

// NEW: Build user message with EXPLICIT SECTION LABELS
const buildSeparatedUserMessage = (
  question: string,
  jobDescription: string,
  resumeContent: string,
): string => {
  let message = "";

  // Always include job description first
  message += `=== JOB DESCRIPTION ===
${jobDescription}

`;

  // Include resume if available
  if (resumeContent) {
    message += `=== CANDIDATE RESUME ===
${resumeContent}

`;
  }

  // Include the actual question
  message += `=== QUESTION ===
${question}`;

  return message;
};

// Helper: Detect task
const detectTask = (question: string): string => {
  const lower = question.toLowerCase();

  if (lower.includes("summarize") || lower.includes("summary"))
    return "SUMMARIZE";
  if (
    lower.includes("improve") ||
    lower.includes("enhance") ||
    lower.includes("better")
  )
    return "IMPROVE";
  if (
    lower.includes("match") ||
    lower.includes("fit") ||
    lower.includes("chance")
  )
    return "JOB_FIT";
  if (
    lower.includes("gap") ||
    lower.includes("missing") ||
    lower.includes("lack")
  )
    return "GAP_ANALYSIS";
  if (
    lower.includes("tailor") ||
    lower.includes("customize") ||
    lower.includes("rewrite")
  )
    return "TAILOR";

  return "GENERAL_ADVICE";
};

// Helper: Check if context needed
const shouldUseContext = (question: string): boolean => {
  const lower = question.toLowerCase().trim();
  const noContextQuestions = [
    "hello",
    "hi",
    "hey",
    "how are you",
    "who are you",
    "what can you do",
    "introduce yourself",
  ];

  return !noContextQuestions.some((q) => lower.includes(q));
};

// Helper: Validate resume
const validateResumeContent = (
  docs: Array<any>,
): "unrelated" | "valid" | "partial" => {
  const combined = docs
    .map((d) => d.pageContent)
    .join(" ")
    .toLowerCase();

  const resumeKeywords = [
    "experience",
    "skills",
    "education",
    "employment",
    "work",
    "qualifications",
    "degree",
    "university",
    "company",
    "project",
  ];

  const matches = resumeKeywords.filter((kw) => combined.includes(kw)).length;

  if (matches < 3) return "unrelated";
  if (matches < 6) return "partial";
  return "valid";
};

// Helper: Format markdown
const formatResponseAsMarkdown = (response: string): string => {
  let formatted = response.replace(/([^\n])\n- /g, "$1\n\n- ");
  formatted = formatted.replace(/([^\n])\n## /g, "$1\n\n## ");
  formatted = formatted.replace(/([^\n])\n### /g, "$1\n\n### ");
  formatted = formatted.replace(/\n{3,}/g, "\n\n");
  return formatted;
};
