import type { RequestHandler } from "express";
import { sendNotImplemented } from "../../utils/not-implemented-response.util";

const suggestionMessage = "Suggestion API foundation is ready; accept/dismiss persistence is implemented in Phase 2.";

export const updateSuggestionStatus: RequestHandler = (_req, res) => {
  sendNotImplemented(res, suggestionMessage);
};
