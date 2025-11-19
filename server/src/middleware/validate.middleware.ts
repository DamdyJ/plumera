import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export function validate(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // or req.params, req.query depending on use case
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to clear messages with exact paths
        const errorDetails = error.errors.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(400).json({
          error: "Validation error",
          details: errorDetails,
        });
      }
      next(error);
    }
  };
}

// export function validate(schema: z.ZodObject<any, any>) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Validate request body against schema
//       const result = schema.safeParse(req.body);

//       if (!result.success) {
//         // Format validation errors
//         const formattedErrors = result.error.errors.map((issue) => ({
//           field: issue.path.join("."),
//           message: issue.message,
//           code: issue.code,
//         }));

//         return res.status(400).json({
//           success: false,
//           error: "Validation Error",
//           details: formattedErrors,
//         });
//       }

//       // Attach validated data to request object
//       req.validated = result.data;
//       return next();
//     } catch (error) {
//       // Handle unexpected errors
//       if (error instanceof ZodError) {
//         return res.status(400).json({
//           success: false,
//           error: "Validation Error",
//           details: error.errors,
//         });
//       }

//       // For other types of errors
//       return res.status(500).json({
//         success: false,
//         error: "Internal Server Error",
//         message: "An unexpected error occurred",
//       });
//     }
//   };
// }
