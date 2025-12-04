import { Router } from "express";
import {
  getChats,
  getChat,
  createChat,
  deleteChat,
  updateChatTitle,
} from "./chat.controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/", getChats);
router.get("/:id", getChat);
router.post("/", upload.single("pdf"), createChat);
router.put("/:id", updateChatTitle);
router.delete("/:id", deleteChat);

export { router as ChatRouter };
