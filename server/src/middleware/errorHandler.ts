import { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
  statusCode?: number;
}

/* eslint-disable */
export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
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
