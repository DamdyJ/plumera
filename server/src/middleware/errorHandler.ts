import { Request, Response, NextFunction } from "express";

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
