export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly cause?: unknown;

  constructor(statusCode: number, message: string, opts?: { cause?: unknown }) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.cause = opts?.cause;

    Error.captureStackTrace?.(this, this.constructor);
  }
}
