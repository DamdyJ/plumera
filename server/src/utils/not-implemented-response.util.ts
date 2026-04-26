import type { Response } from "express";

export function sendNotImplemented(res: Response, message: string): void {
  res.status(501).json({
    success: false,
    statusCode: 501,
    error: {
      message,
    },
  });
}
