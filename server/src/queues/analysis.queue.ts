import { Queue } from "bullmq";
import {
  ANALYSIS_QUEUE_NAME,
  createRedisConnection,
} from "../lib/redis.client";

export interface AnalysisJobData {
  analysisRunId: string;
  resumeId: string;
  userId: string;
}

export const createAnalysisQueue = (): Queue<AnalysisJobData> =>
  new Queue<AnalysisJobData>(ANALYSIS_QUEUE_NAME, {
    connection: createRedisConnection(),
  });
