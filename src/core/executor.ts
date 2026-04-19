import { randomBytes } from "node:crypto";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
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
  let concatListPath: string | undefined;
  try {
    validateCommandParams(command, params);
    const outputPath = getRequiredStringParam(params, "outputPath");

    if (!isSupportedFormat(outputPath, command.outputFormats)) {
      return {
        success: false,
        message: `Output format is not supported for ${command.id}.`,
      };
    }

    let inputPath: string;
    let resolvedInputPaths: string[] = [];

    if (commandUsesInputPathsParam(command)) {
      resolvedInputPaths = normalizeInputPathsFromParams(params);
      if (resolvedInputPaths.length === 0) {
        return { success: false, message: `Missing or invalid parameter "inputPaths".` };
      }
      for (const filePath of resolvedInputPaths) {
        if (!existsSync(filePath)) {
          return { success: false, message: `Input file not found: ${filePath}` };
        }
        if (!isSupportedFormat(filePath, command.inputFormats)) {
          return {
            success: false,
            message: `Input format is not supported for ${command.id}: ${filePath}`,
          };
        }
      }
      inputPath = resolvedInputPaths[0] ?? "";
    } else {
      inputPath = resolve(getRequiredStringParam(params, "inputPath"));
      if (!existsSync(inputPath)) {
        return { success: false, message: `Input file not found: ${inputPath}` };
      }
      if (!isSupportedFormat(inputPath, command.inputFormats)) {
        return {
          success: false,
          message: `Input format is not supported for ${command.id}.`,
        };
      }
    }

    if (command.id === "video_merge") {
      concatListPath = join(tmpdir(), `ffkity-concat-${randomBytes(8).toString("hex")}.txt`);
      writeFileSync(concatListPath, buildConcatDemuxerListContent(resolvedInputPaths), "utf-8");
    }

    const args = command.buildFfmpegArgs({
      inputPath,
      outputPath,
      params,
      concatListPath,
    });
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
  } finally {
    if (concatListPath !== undefined) {
      try {
        unlinkSync(concatListPath);
      } catch {
        // ignore cleanup errors
      }
    }
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

function commandUsesInputPathsParam(command: CommandDescriptor): boolean {
  return command.parameters.some((parameter) => parameter.type === "paths" && parameter.key === "inputPaths");
}

function normalizeInputPathsFromParams(params: Record<string, unknown>): string[] {
  const raw = params.inputPaths;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => (typeof entry === "string" ? resolve(entry.trim()) : ""))
    .filter((entry) => entry.length > 0);
}

function escapeConcatDemuxerPath(filePath: string): string {
  return filePath.replace(/'/g, `'\\''`);
}

function buildConcatDemuxerListContent(absolutePaths: string[]): string {
  return absolutePaths.map((filePath) => `file '${escapeConcatDemuxerPath(filePath)}'`).join("\n");
}
