import { Request, Response, NextFunction } from "express";
import logger from "src/utils/logger.util";

interface HttpError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(err);
  }

  logger.error("Error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode ?? 500;

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: {
      message: err.message || "Internal Server Error",
    },
    traceId: res.locals.traceId,
  });
}
