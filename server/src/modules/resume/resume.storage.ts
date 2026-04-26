import { supabase } from "../../lib/supabase.client";
import { HttpError } from "../../utils/http-error.util";
import path from "path";

interface SupabaseUploadResult {
  data: { path?: string; fullPath?: string } | null;
  error: { message?: string } | null;
}

interface SupabaseStorageClient {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Buffer,
        options: { contentType: string; upsert: boolean },
      ): Promise<SupabaseUploadResult>;
    };
  };
}

export interface StoredResumeFile {
  path: string;
  fullPath: string;
}

export interface ResumeUploadFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

const toStorageSlug = (filename: string): string => {
  const extension = path.extname(filename).toLowerCase() || ".pdf";
  const basename = path.basename(filename, extension).trim();
  const slug = basename
    .replace(/[^a-zA-Z0-9 \-_]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return `${slug || "resume"}${extension}`;
};

export const saveResumePdf = async (
  file: ResumeUploadFile,
  client: SupabaseStorageClient = supabase,
): Promise<StoredResumeFile> => {
  const bucket = process.env.BUCKET_NAME;

  if (!bucket) {
    throw new HttpError(500, "BUCKET_NAME is not configured");
  }

  const filePath = `resumes/${crypto.randomUUID()}-${toStorageSlug(file.originalname)}`;
  const { data, error } = await client.storage.from(bucket).upload(
    filePath,
    file.buffer,
    {
      contentType: file.mimetype,
      upsert: false,
    },
  );

  if (error) {
    throw new HttpError(
      500,
      `Supabase upload failed: ${error.message ?? "unknown error"}`,
    );
  }

  if (!data) {
    throw new HttpError(500, "Supabase returned no upload data");
  }

  return {
    path: data.path ?? filePath,
    fullPath: data.fullPath ?? filePath,
  };
};
