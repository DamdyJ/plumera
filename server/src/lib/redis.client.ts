import IORedis from "ioredis";

export const ANALYSIS_QUEUE_NAME = "analysis";

export const getRedisUrl = (): string => {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error("REDIS_URL is not configured");
  }

  return url;
};

export const createRedisConnection = (): IORedis =>
  new IORedis(getRedisUrl(), { maxRetriesPerRequest: null });
