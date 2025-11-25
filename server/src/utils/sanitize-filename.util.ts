import path from "path";

export function sanitizeFilename(filename: string) {
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  const name = basename
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9 \-_]/g, "");
  return `${name + "_" + Date.now() + extension}`;
}
