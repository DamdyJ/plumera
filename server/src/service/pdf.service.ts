import { cachedEmbeddings } from "../lib/gemini";
import { pineconeIndex } from "../lib/pineconedb";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { supabase } from "src/lib/supabase";

export async function storeEmbeddingDocument(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const loader = new WebPDFLoader(blob);
  const docs = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await textSplitter.splitDocuments(docs);
  return await PineconeStore.fromDocuments(splitDocs, cachedEmbeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });
}

export async function savePdfToDatabase(file: Express.Multer.File) {
  const bucket = process.env.BUCKET_NAME!;
  const path = `uploads/${file.originalname}`;

  const { data } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  return data;
}
