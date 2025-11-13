import { cachedEmbeddings } from "../lib/gemini";
import { pineconeIndex } from "../lib/pineconedb";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { supabase } from "src/lib/supabase";
import { HttpError } from "src/lib/httpError";

export async function storeEmbeddingDocument(url: string) {
  const response = await fetch(url, {
    method: "GET",
  });
  if (!response.ok)
    throw new HttpError(
      response.status,
      `Failed to fetch PDF: ${response.statusText}`,
    );

  const blob = await response.blob();
  if (!blob || blob.size === 0)
    throw new HttpError(400, "Downloaded file is empty");

  const loader = new WebPDFLoader(blob);
  if (!loader) throw new HttpError(400, "loader error");

  const docs = await loader.load();

  if (!docs) throw new HttpError(400, "DOCS error");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  if (!textSplitter) throw new HttpError(400, "textSplitter error");
  const splitDocs = await textSplitter.splitDocuments(docs);

  if (!splitDocs) throw new HttpError(400, "splitDocs error");
  const result = await PineconeStore.fromDocuments(
    splitDocs,
    cachedEmbeddings,
    {
      pineconeIndex,
      maxConcurrency: 5,
    },
  );
  if (!result)
    throw new HttpError(500, "Failed to store documents in pineconedb");
  return result;
}

export async function savePdfToDatabase(file: Express.Multer.File) {
  const bucket = process.env.BUCKET_NAME!;
  const path = `uploads/${Date.now() + file.originalname}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
  if (error) {
    throw new HttpError(
      500,
      `Supabase upload failed: ${error.message ?? error}`,
    );
  }
  if (!data) throw new HttpError(500, "Supabase returned no data");
  return data;
}
