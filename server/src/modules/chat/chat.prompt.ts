export type ChatTask =
  | "SUMMARIZE"
  | "IMPROVE"
  | "JOB_FIT"
  | "GAP_ANALYSIS"
  | "TAILOR"
  | "GENERAL_ADVICE";

export type ResumeQuality = "unrelated" | "valid" | "partial";

export interface BuildContextPromptInput {
  task: ChatTask;
  jobTitle: string;
  resumeQuality: ResumeQuality;
}

export interface BuildUserMessageInput {
  question: string;
  jobDescription: string;
  resumeMarkdown?: string;
}

export const detectChatTask = (question: string): ChatTask => {
  const lower = question.toLowerCase();

  if (lower.includes("summarize") || lower.includes("summary")) {
    return "SUMMARIZE";
  }

  if (
    lower.includes("improve") ||
    lower.includes("enhance") ||
    lower.includes("better")
  ) {
    return "IMPROVE";
  }

  if (
    lower.includes("match") ||
    lower.includes("fit") ||
    lower.includes("chance")
  ) {
    return "JOB_FIT";
  }

  if (
    lower.includes("gap") ||
    lower.includes("missing") ||
    lower.includes("lack")
  ) {
    return "GAP_ANALYSIS";
  }

  if (
    lower.includes("tailor") ||
    lower.includes("customize") ||
    lower.includes("rewrite")
  ) {
    return "TAILOR";
  }

  return "GENERAL_ADVICE";
};

export const shouldUseResumeContext = (question: string): boolean => {
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

  return !noContextQuestions.some(
    (value) => lower === value || lower.startsWith(`${value} `),
  );
};

export const validateResumeMarkdown = (markdown: string): ResumeQuality => {
  const lower = markdown.toLowerCase();
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

  const matches = resumeKeywords.filter((keyword) =>
    lower.includes(keyword),
  ).length;

  if (matches < 3) {
    return "unrelated";
  }

  if (matches < 6) {
    return "partial";
  }

  return "valid";
};

export const buildSeparatedContextPrompt = ({
  task,
  jobTitle,
  resumeQuality,
}: BuildContextPromptInput): string => {
  const baseRole = `You are Plumera, an expert resume coach and recruiter.

**YOUR ROLE:**
- Analyze resumes for a specific job target
- Compare candidate skills to job requirements
- Provide actionable improvement advice

**CRITICAL INSTRUCTION - CONTEXT SEPARATION:**
The user will provide job description, candidate resume, and question as separate labeled sections.
Do not blend employer requirements with candidate experience.`;

  if (resumeQuality === "unrelated") {
    return `${baseRole}\n\nThe uploaded file is not a resume. Ask for a valid resume/CV file.`;
  }

  if (resumeQuality === "partial") {
    return `${baseRole}\n\nThe resume appears incomplete. Work with what is available.`;
  }

  const taskInstructions: Record<ChatTask, string> = {
    SUMMARIZE: `Summarize the candidate background for the "${jobTitle}" role without inventing facts.`,
    IMPROVE: "Suggest specific resume improvements with before/after examples.",
    JOB_FIT: `Assess candidate fit for the "${jobTitle}" role by separating job needs from resume evidence.`,
    GAP_ANALYSIS:
      "Identify missing skills and explain how important each gap is.",
    TAILOR: "Suggest accurate wording that better matches the job description.",
    GENERAL_ADVICE:
      "Answer the user's question with concrete resume and job evidence.",
  };

  return `${baseRole}\n\n${taskInstructions[task]}`;
};

export const buildSeparatedUserMessage = ({
  question,
  jobDescription,
  resumeMarkdown,
}: BuildUserMessageInput): string => {
  const resumeSection = resumeMarkdown
    ? `\n\n=== CANDIDATE RESUME ===\n${resumeMarkdown}`
    : "";

  return `=== JOB DESCRIPTION ===\n${jobDescription}${resumeSection}\n\n=== QUESTION ===\n${question}`;
};

export const formatResponseAsMarkdown = (response: string): string => {
  let formatted = response.replace(/([^\n])\n- /g, "$1\n\n- ");
  formatted = formatted.replace(/([^\n])\n## /g, "$1\n\n## ");
  formatted = formatted.replace(/([^\n])\n### /g, "$1\n\n### ");
  return formatted.replace(/\n{3,}/g, "\n\n");
};
