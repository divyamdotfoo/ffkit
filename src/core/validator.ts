import type { CommandDescriptor } from "../types.ts";

export interface ValidationResult {
  ok: true;
}

function ensureNumber(key: string, value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Parameter "${key}" must be a number.`);
  }
  return value;
}

export function validateCommandParams(
  command: CommandDescriptor,
  params: Record<string, unknown>,
): ValidationResult {
  for (const parameter of command.parameters) {
    const value = params[parameter.key];
    if (parameter.required && (value === undefined || value === null || value === "")) {
      throw new Error(`Missing required parameter "${parameter.key}".`);
    }
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (parameter.type === "number") {
      const numberValue = ensureNumber(parameter.key, value);
      if (typeof parameter.min === "number" && numberValue < parameter.min) {
        throw new Error(`Parameter "${parameter.key}" must be >= ${parameter.min}.`);
      }
      if (typeof parameter.max === "number" && numberValue > parameter.max) {
        throw new Error(`Parameter "${parameter.key}" must be <= ${parameter.max}.`);
      }
      continue;
    }

    if (parameter.type === "enum") {
      if (typeof value !== "string") {
        throw new Error(`Parameter "${parameter.key}" must be a string option.`);
      }
      if (!parameter.options?.includes(value)) {
        throw new Error(
          `Parameter "${parameter.key}" must be one of: ${(parameter.options ?? []).join(", ")}.`,
        );
      }
      continue;
    }

    if (parameter.type === "file" || parameter.type === "string") {
      if (typeof value !== "string") {
        throw new Error(`Parameter "${parameter.key}" must be a string.`);
      }
    }
  }

  return { ok: true };
}
