import { Router } from "express";
import { createChatMessage, listChatHistory } from "./chat.controller";

export const ChatRouter = Router({ mergeParams: true });

ChatRouter.post("/:resumeId/chat", createChatMessage);
ChatRouter.get("/:resumeId/chat/history", listChatHistory);
