import "express";

declare global {
  namespace Express {
    interface Locals {
      traceId: string;
    }

    interface Response {
      locals: Locals;
    }
  }
}
