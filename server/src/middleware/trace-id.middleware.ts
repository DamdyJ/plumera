import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const traceId = req.header("X-Request-Id") || randomUUID();
  res.setHeader("X-Request-Id", traceId);
  res.locals.traceId = traceId;
  next();
}
