import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : process.env.CLIENT_URL,
  credentials: false,
  allowedHeaders: ["Content-Type", "Authorization"],
};
