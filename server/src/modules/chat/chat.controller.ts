import type { RequestHandler } from "express";
import { sendNotImplemented } from "../../utils/not-implemented-response.util";

const chatMessage = "Chat API foundation is ready; contextual AI responses are implemented in Phase 2.";

export const createChatMessage: RequestHandler = (_req, res) => {
  sendNotImplemented(res, chatMessage);
};

export const listChatHistory: RequestHandler = (_req, res) => {
  sendNotImplemented(res, chatMessage);
};
