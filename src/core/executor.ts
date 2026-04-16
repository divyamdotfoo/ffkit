import { existsSync } from "node:fs";
import { extname } from "node:path";
import { spawnSync } from "node:child_process";

import type { CommandDescriptor } from "../types.ts";
import { validateCommandParams } from "./validator.ts";

export interface ExecutionResult {
  success: boolean;
  message: string;
}

export async function executeCommand(
  command: CommandDescriptor,
  params: Record<string, unknown>,
): Promise<ExecutionResult> {
  try {
    validateCommandParams(command, params);
    const inputPath = getRequiredStringParam(params, "inputPath");
    const outputPath = getRequiredStringParam(params, "outputPath");

    if (!existsSync(inputPath)) {
      return { success: false, message: `Input file not found: ${inputPath}` };
    }
    if (!isSupportedFormat(inputPath, command.inputFormats)) {
      return {
        success: false,
        message: `Input format is not supported for ${command.id}.`,
      };
    }
    if (!isSupportedFormat(outputPath, command.outputFormats)) {
      return {
        success: false,
        message: `Output format is not supported for ${command.id}.`,
      };
    }

    const args = command.buildFfmpegArgs({ inputPath, outputPath, params });
    const result = spawnSync("ffmpeg", ["-y", ...args], {
      encoding: "utf-8",
      stdio: "pipe",
      shell: false,
      windowsHide: true,
    });

    if (result.error) {
      return { success: false, message: result.error.message };
    }
    if (result.status !== 0) {
      return {
        success: false,
        message:
          result.stderr.trim() ||
          result.stdout.trim() ||
          "ffmpeg exited with a non-zero status.",
      };
    }

    return {
      success: true,
      message: `Saved output to ${outputPath}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }

}

function getRequiredStringParam(params: Record<string, unknown>, key: string): string {
  const value = params[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required parameter "${key}".`);
  }
  return value.trim();
}

function isSupportedFormat(filePath: string, supportedFormats: string[]): boolean {
  if (supportedFormats.length === 0) {
    return false;
  }
  const extension = extname(filePath).replace(".", "").toLowerCase();
  return supportedFormats.includes(extension);
}
