import { Router } from "express";
import { updateSuggestionStatus } from "./suggestion.controller";

export const SuggestionRouter = Router();

SuggestionRouter.patch("/:suggestionId", updateSuggestionStatus);
