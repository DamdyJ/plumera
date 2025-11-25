import { Router } from "express";
import {
  getChats,
  getChat,
  createChat,
  deleteChat,
} from "src/modules/chat/chat.controller";
import multer from "multer";
import { requireAuth } from "@clerk/express";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/", requireAuth(), getChats);
router.get("/:id", requireAuth(), getChat);
router.post("/", upload.single("pdf"), requireAuth(), createChat);
router.delete("/:id", requireAuth(), deleteChat);

export { router as ChatRouter };
