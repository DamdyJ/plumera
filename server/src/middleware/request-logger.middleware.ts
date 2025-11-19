import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.util";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const { method, originalUrl, params, query } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData: Record<string, unknown> = {
      method,
      url: originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    // Only add these if they have content
    if (req.body && Object.keys(req.body as Record<string, unknown>).length > 0)
      logData.body = req.body;
    if (Object.keys(params).length > 0) logData.params = params;
    if (Object.keys(query).length > 0) logData.query = query;

    // Add file info if present
    if (req.file) {
      logData.file = {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: `${(req.file.size / 1024).toFixed(2)}KB`,
      };
    }

    logger.info("Request", logData);
  });

  next();
};
