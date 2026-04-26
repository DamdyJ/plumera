import { describe, expect, it } from "bun:test";
import type { AddressInfo } from "node:net";
import app from "./app";

async function withServer<T>(callback: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address = server.address() as AddressInfo;

  try {
    return await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

describe("app routes", () => {
  it("serves health", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/health`);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ status: "ok" });
    });
  });

  it("mounts Phase 1 V2 API route stubs", async () => {
    await withServer(async (baseUrl) => {
      const checks = [
        fetch(`${baseUrl}/api/resumes`),
        fetch(`${baseUrl}/api/resumes/resume-1/analyze`, { method: "POST" }),
        fetch(`${baseUrl}/api/resumes/resume-1/chat/history`),
        fetch(`${baseUrl}/api/suggestions/suggestion-1`, { method: "PATCH" }),
      ];

      const responses = await Promise.all(checks);

      expect(responses.map((response) => response.status)).toEqual([
        501, 501, 501, 501,
      ]);
    });
  });
});
