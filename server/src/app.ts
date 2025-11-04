import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { traceMiddleware } from "./middleware/trace";
import { clerkWebhooks } from "./controller/clerk.webhooks.controller";

const app = express();
app.use(traceMiddleware);
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(helmet());

app.post("/api/webhooks", express.raw({ type: 'application/json' }), clerkWebhooks);

export default app;
