import type { CommandDescriptor } from "../types.ts";

export interface ValidationResult {
  ok: true;
}

export function validateCommandParams(
  _command: CommandDescriptor,
  _params: Record<string, unknown>,
): ValidationResult {
  return { ok: true };
}
