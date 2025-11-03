import { z } from "zod";

export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    // В серверной среде используем простую очистку без DOMPurify
    return input
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "&#x27;")
      .substring(0, 10000);
  }

  static sanitizeLog(input: unknown): string {
    if (typeof input === "string") {
      return input.replace(/[\r\n\t]/g, "_").substring(0, 1000);
    }
    return String(input)
      .replace(/[\r\n\t]/g, "_")
      .substring(0, 1000);
  }

  static validatePath(path: string): string {
    const schema = z.string().regex(/^[a-zA-Z0-9._/-]+$/);
    const sanitized = path
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9._/-]/g, "");
    return schema.parse(sanitized);
  }

  static sanitizeCommand(input: string): never {
    throw new Error("Command execution not allowed");
  }
}
