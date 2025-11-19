import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
