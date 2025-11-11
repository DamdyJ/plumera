import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { traceMiddleware } from "./middleware/trace";
import { clerkWebhooks } from "./controller/clerk.webhooks.controller";
import multer from "multer";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/errorHandler";
import ChatRouter from "./routes/chat.route";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(traceMiddleware);
app.use(clerkMiddleware());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(helmet());

app.post(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  clerkWebhooks,
);
app.use("/api/embedding", upload.single("file"), ChatRouter);

app.use(errorHandler);

export default app;
