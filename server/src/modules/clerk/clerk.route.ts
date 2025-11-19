import express from "express";
import { clerkWebhooks } from "./clerk.webhooks.controller";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), clerkWebhooks);

export { router as ClerkWebhookRouter };
