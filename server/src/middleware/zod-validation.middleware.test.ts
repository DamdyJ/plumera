import { describe, expect, it } from "bun:test";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { zodValidation } from "./zod-validation.middleware";

describe("zodValidation", () => {
  it("serializes Zod issues into a 400 response", () => {
    const result = z.object({ name: z.string() }).safeParse({});
    if (result.success) {
      throw new Error("Expected schema parsing to fail");
    }

    let statusCode = 0;
    let payload: unknown;
    const response = {
      status(code: number) {
        statusCode = code;
        return response as Response;
      },
      json(body: unknown) {
        payload = body;
        return response as Response;
      },
    } as Response;

    const next: NextFunction = () => undefined;
    zodValidation(result.error, {} as Request, response, next);

    expect(statusCode).toBe(400);
    expect(payload).toEqual({
      error: "Validation error",
      details: [{ path: "name", message: expect.any(String) }],
    });
  });
});
