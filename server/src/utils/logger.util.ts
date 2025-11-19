import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: "http",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.splat(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        align(),
        printf((info) => {
          const { level, message, ...rest } = info;
          const meta = Object.keys(rest).length
            ? `\n${JSON.stringify(rest, null, 2)}`
            : "";
          const levelStr = String(level);
          const messageStr = String(message);
          return `${levelStr}: ${messageStr}${meta}`;
        }),
      ),
    }),
    // File transport (keeps JSON format)
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
  exitOnError: false,
});

export default logger;
