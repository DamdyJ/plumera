import { afterEach, describe, expect, it } from "bun:test";
import { ResumeUploadFile, saveResumePdf } from "./resume.storage";

const originalBucketName = process.env.BUCKET_NAME;

afterEach(() => {
  process.env.BUCKET_NAME = originalBucketName;
});

describe("resume storage", () => {
  it("uploads a sanitized PDF path to Supabase storage", async () => {
    process.env.BUCKET_NAME = "resumes";
    const uploads: Array<{ bucket: string; path: string; contentType: string }> = [];
    const client = {
      storage: {
        from: (bucket: string) => ({
          upload: async (
            path: string,
            _body: Buffer,
            options: { contentType: string; upsert: boolean },
          ) => {
            uploads.push({ bucket, path, contentType: options.contentType });
            return { data: { path, fullPath: `resumes/${path}` }, error: null };
          },
        }),
      },
    };

    const result = await saveResumePdf(
      {
        originalname: "My Resume 2026.pdf",
        buffer: Buffer.from("pdf"),
        mimetype: "application/pdf",
      } satisfies ResumeUploadFile,
      client,
    );

    expect(uploads).toHaveLength(1);
    expect(uploads[0].bucket).toBe("resumes");
    expect(uploads[0].path).toContain("my-resume-2026.pdf");
    expect(uploads[0].contentType).toBe("application/pdf");
    expect(result.fullPath).toContain("my-resume-2026.pdf");
  });

  it("fails clearly when BUCKET_NAME is missing", async () => {
    delete process.env.BUCKET_NAME;

    await expect(
      saveResumePdf({
        originalname: "resume.pdf",
        buffer: Buffer.from("pdf"),
        mimetype: "application/pdf",
      }),
    ).rejects.toThrow("BUCKET_NAME is not configured");
  });
});
