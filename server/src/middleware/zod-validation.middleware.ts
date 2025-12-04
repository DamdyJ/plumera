import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function zodValidation(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof ZodError) {
    const errorDetails = error.errors.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      error: "Validation error",
      details: errorDetails,
    });
  }
  next(error);
}
