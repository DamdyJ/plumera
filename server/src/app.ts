import "dotenv/config";
import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import { traceMiddleware } from "./middleware/trace-id.middleware";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/error-handler.middleware";
import { corsOptions } from "./lib/cors.config";
import { zodValidation } from "./middleware/zod-validation.middleware";
import { AnalysisRouter } from "./modules/analysis/analysis.route";
import { ChatRouter } from "./modules/chat/chat.route";
import { ResumeRouter } from "./modules/resume/resume.route";
import { SuggestionRouter } from "./modules/suggestion/suggestion.route";

const app = express();

app.use(traceMiddleware);
app.use(cors(corsOptions));
app.use(clerkMiddleware());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(helmet());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/resumes", ResumeRouter);
app.use("/api/resumes", AnalysisRouter);
app.use("/api/resumes", ChatRouter);
app.use("/api/suggestions", SuggestionRouter);

app.use(zodValidation);
app.use(errorHandler);

export default app;
