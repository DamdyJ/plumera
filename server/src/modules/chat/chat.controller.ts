import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "src/utils/async-handler.util";
import { HttpError } from "src/utils/http-error.util";
import {
  findChatsByUserId,
  findChatById,
  saveChat,
  removeChatById,
  updateChatTitleById,
} from "src/modules/chat/chat.service";
import { createChatSchema, updateChatSchema } from "./chat.dto";

// Get all chats for the authenticated user
export const getChats = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuth(req).userId;
  if (!userId) throw new HttpError(401, "Unauthorized user");

  const data = await findChatsByUserId(userId);
  return res.status(200).json(data);
});

// Get a single chat by ID
export const getChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuth(req).userId;
  if (!userId) throw new HttpError(401, "Unauthorized user");

  const { id } = req.params;
  if (!id) throw new HttpError(400, "Chat ID is required");

  const data = await findChatById(id, userId);

  if (!data) {
    throw new HttpError(404, "Chat not found or you don't have access to it");
  }

  return res.status(200).json(data);
});

// Create a new chat
export const createChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuth(req).userId;
  if (!userId) throw new HttpError(401, "Unauthorized user");

  // Validate request body
  const validationResult = createChatSchema.safeParse(req.body);
  if (!validationResult.success) {
    // Throw ZodError so zodValidation middleware can handle it
    throw validationResult.error;
  }

  // Validate file
  const file = req.file;
  if (!file) {
    throw new HttpError(400, "PDF file is required");
  }

  // Validate file type
  if (!file.mimetype || !file.mimetype.includes("pdf")) {
    throw new HttpError(400, "Only PDF files are allowed");
  }

  // Validate file size (10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new HttpError(413, "File size exceeds 10MB limit");
  }

  if (file.size === 0) {
    throw new HttpError(400, "File cannot be empty");
  }

  const data = await saveChat(userId, file, validationResult.data);
  return res.status(201).json(data);
});

// Update chat title
export const updateChatTitle = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuth(req).userId;
    if (!userId) throw new HttpError(401, "Unauthorized user");

    const { id } = req.params;
    const { chatTitle } = updateChatSchema.parse(req.body);

    if (!id) throw new HttpError(400, "Chat ID is required");
    if (!chatTitle) throw new HttpError(400, "Chat title is required");

    // Verify the chat exists and belongs to the user
    const chat = await findChatById(id, userId);
    if (!chat) {
      throw new HttpError(404, "Chat not found or you don't have access to it");
    }

    const updatedChat = await updateChatTitleById(id, chatTitle);
    return res.status(200).json(updatedChat);
  },
);

// Delete a chat by ID
export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuth(req).userId;
  if (!userId) throw new HttpError(401, "Unauthorized user");

  const { id } = req.params;
  if (!id) throw new HttpError(400, "Chat ID is required");

  // Verify chat exists and belongs to user
  const chat = await findChatById(id, userId);
  if (!chat) {
    throw new HttpError(404, "Chat not found or you don't have access to it");
  }

  await removeChatById(id);
  return res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});

// Score user resume/cv base on job title and description
export const scoreChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuth(req).userId;
  if (!userId) throw new HttpError(401, "Unauthorized user");

  const { id } = req.params;
  if (!id) throw new HttpError(400, "Chat ID is required");

  // Verify chat exists and belongs to user
  const chat = await findChatById(id, userId);
  if (!chat) {
    throw new HttpError(404, "Chat not found or you don't have access to it");
  }

  const updatedChat = await updateChatTitleById(id, chat.chatTitle);
  return res.status(200).json({ success: true, data: updatedChat });
});
