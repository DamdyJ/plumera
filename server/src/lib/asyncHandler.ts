import type { RequestHandler, Request, Response, NextFunction } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
  return (req, res, next) => {
    try {
      const maybePromise = fn(req, res, next);
      Promise.resolve(maybePromise).catch(next);
    } catch (err) {
      next(err);
    }
  };
};
