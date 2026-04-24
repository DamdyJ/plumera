import "dotenv/config";
import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import { traceMiddleware } from "./middleware/trace-id.middleware";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/error-handler.middleware";
import { corsOptions } from "./lib/cors.config";
import { ChatRouter } from "./modules/chat/chat.route";
import { zodValidation } from "./middleware/zod-validation.middleware";
import { MessageRouter } from "./modules/message/message.route";

const app = express();

app.use(traceMiddleware);
app.use(cors(corsOptions));
app.use(clerkMiddleware());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(helmet());

app.use("/api/chats", ChatRouter);
app.use("/api/chats/:id/messages", MessageRouter);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(zodValidation);
app.use(errorHandler);

export default app;
