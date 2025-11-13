import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { traceMiddleware } from "./middleware/trace";
import { clerkWebhooks } from "./controller/clerk.webhooks.controller";
import multer from "multer";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/errorHandler";
import ChatRouter from "./routes/chat.route";
import cors, { CorsOptions } from "cors";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(traceMiddleware);
app.use(clerkMiddleware());
app.use(urlencoded({ extended: true }));
app.use(json());
const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(helmet());

app.post(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  clerkWebhooks,
);
app.use("/api/chat", upload.single("file"), ChatRouter);

app.use(errorHandler);

export default app;
