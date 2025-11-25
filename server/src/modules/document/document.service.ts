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
    throw new HttpError(400, "No documents extracted from PDF");
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

  const docs = await vectorStore.similaritySearch(question, limit, {
    documentId,
  });

  const context = docs.map((doc) => doc.pageContent).join("\n\n---\n\n");

const prompt = ChatPromptTemplate.fromTemplate(`
    You are an expert Senior Technical Recruiter coaching a candidate. 
    
    ### CONTEXT
    - **Target Job:** {jobTitle}
    - **Job Description Summary:** {jobDescription}
    - **Candidate Resume Snippets:** {context}
    
    ### USER INPUT
    {input}

    ### CORE INSTRUCTIONS
    1. **Identify the Core Intent:** Is the user asking for a definition, a specific skill check, or a full review?
    2. **Answer ONLY what was asked:** Do not provide a full resume review unless explicitly asked.
    3. **Progressive Disclosure:** - If the answer is long, summarize the top 3 points.
       - End with a *single*, short, relevant follow-up question to keep the conversation going (e.g., "Would you like an example of how to list this on your resume?").
    4. **Tone:** Professional, direct, "Senior Colleague" vibe. No "Hello there" fluff.

    ### FORMATTING RULES (STRICT)
    - **No "Mode" Labels:** Never output "Mode A" or "Analysis". Just speak.
    - **Compact Markdown:** - Use single line breaks.
       - Use bolding **only** for key terms.
       - Use short bullet points.
    - **No Double Spacing:** Do not add extra newlines between list items.

    ### EXAMPLE GOOD RESPONSE (Style Guide)
    **Kotlin** is a static language for Android. It is listed in the JD as a requirement.
    
    * **Resume Fit:** You don't have it listed.
    * **Importance:** High (Critical Skill).
    
    *Would you like a project idea to add this to your portfolio?*

    Answer the user now:
  `);

  const chain = prompt.pipe(gemini).pipe(new StringOutputParser());
  const response = await chain.invoke({
    context: context,
    input: question,
    jobTitle: jobTitle,
    jobDescription: jobDescription,
  });
  return response;
};
