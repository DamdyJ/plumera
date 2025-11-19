import { Router } from "express";
import { create } from "src/modules/chat/chat.controller";
import multer from "multer";
import { validate } from "src/middleware/validate.middleware";
import { createChatDTO } from "src/modules/chat/chat.dto";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// router.get("/", index);
router.post("/", upload.single("pdf"), validate(createChatDTO), create);

export { router as ChatRouter };
