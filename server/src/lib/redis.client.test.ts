import { afterEach, describe, expect, it } from "bun:test";
import { ANALYSIS_QUEUE_NAME, getRedisUrl } from "./redis.client";

const originalRedisUrl = process.env.REDIS_URL;

afterEach(() => {
  process.env.REDIS_URL = originalRedisUrl;
});

describe("redis client config", () => {
  it("uses the analysis queue name", () => {
    expect(ANALYSIS_QUEUE_NAME).toBe("analysis");
  });

  it("requires REDIS_URL", () => {
    delete process.env.REDIS_URL;
    expect(() => getRedisUrl()).toThrow("REDIS_URL is not configured");
  });

  it("returns REDIS_URL when configured", () => {
    process.env.REDIS_URL = "redis://localhost:6379";
    expect(getRedisUrl()).toBe("redis://localhost:6379");
  });
});
