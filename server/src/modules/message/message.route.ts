import { Router } from "express";

import { requireAuth } from "@clerk/express";
import { createMessage, getMessages } from "./message.controller";

const router = Router({ mergeParams: true });

router.get("/", requireAuth(), getMessages);
router.post("/", requireAuth(), createMessage);

export { router as MessageRouter };
