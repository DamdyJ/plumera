import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { traceMiddleware } from "./middleware/trace-id.middleware";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/error-handler.middleware";
import cors from "cors";
import { requestLogger } from "./middleware/request-logger.middleware";
import { corsOptions } from "./lib/cors.config";
import { ClerkWebhookRouter } from "./modules/clerk/clerk.route";
import { ChatRouter } from "./modules/chat/chat.route";

const app = express();

app.use(traceMiddleware);
app.use(clerkMiddleware());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(requestLogger);

app.use("/api/webhooks", ClerkWebhookRouter);
app.use("/api/chat", ChatRouter);

app.use(errorHandler);

export default app;
