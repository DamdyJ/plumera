import { Worker } from "bullmq";
import type { AnalysisJobData } from "../queues/analysis.queue";
import {
  ANALYSIS_QUEUE_NAME,
  createRedisConnection,
} from "../lib/redis.client";

export interface AnalysisWorkerResult {
  analysisRunId: string;
  status: "queued";
}

export const createAnalysisWorker = (): Worker<
  AnalysisJobData,
  AnalysisWorkerResult
> =>
  new Worker<AnalysisJobData, AnalysisWorkerResult>(
    ANALYSIS_QUEUE_NAME,
    async (job) => ({
      analysisRunId: job.data.analysisRunId,
      status: "queued",
    }),
    { connection: createRedisConnection() },
  );
