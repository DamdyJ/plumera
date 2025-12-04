import { Router } from "express";

import { createMessage, getMessages } from "./message.controller.js";

const router = Router({ mergeParams: true });

router.get("/", getMessages);
router.post("/", createMessage);

export { router as MessageRouter };
