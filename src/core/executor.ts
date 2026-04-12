import type { CommandDescriptor } from "../types.ts";

export interface ExecutionResult {
  success: boolean;
  message: string;
}

export async function executeCommand(
  _command: CommandDescriptor,
  _params: Record<string, unknown>,
): Promise<ExecutionResult> {
  return {
    success: false,
    message: "Execution is not implemented yet (skeleton).",
  };
}
