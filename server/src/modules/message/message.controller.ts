import { asyncHandler } from "../../utils/async-handler.util.js";
import { Request, Response } from "express";
import { fetchMessageByChatId, saveMessage } from "./message.service.js";
import { getAuth } from "@clerk/express";
import { HttpError } from "../../utils/http-error.util.js";
import { createMessageSchema } from "./message.dto.js";

// get all messages
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { id: chatId } = req.params;
  const data = await fetchMessageByChatId(chatId);
  return res.status(200).json(data);
});

// create new message
export const createMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuth(req).userId;
    if (!userId) throw new HttpError(401, "Unauthorized user");
    const { id: chatId } = req.params;

    const validationResult = createMessageSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const data = await saveMessage(chatId, validationResult.data.prompt);

    return res.status(201).json({ success: true, data });
  },
);
