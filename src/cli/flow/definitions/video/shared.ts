import { dirname, extname, join, parse } from "node:path";

import type { FlowState } from "../../types.ts";

export function getVideoOutputPath(state: FlowState): string {
  const commandId = asString(state.values.commandId);
  const mergeOrdered =
    commandId === "video_merge" && Array.isArray(state.values.mergeOrderedPaths)
      ? state.values.mergeOrderedPaths.filter((path): path is string => typeof path === "string" && path.length > 0)
      : [];
  const inputPath =
    mergeOrdered.length > 0 ? mergeOrdered[0]! : asString(state.values.inputPath);
  const outputPath = asString(state.values.outputPath);
  if (outputPath) {
    return outputPath;
  }
  if (!inputPath) {
    return "";
  }
  const targetFormat = asString(state.values.targetFormat);
  const parsed = parse(inputPath);
  const dir = dirname(inputPath);
  const extension = getVideoExtension(commandId, inputPath, targetFormat);
  return join(dir, `${parsed.name}.ffkity.${extension}`);
}

export function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  const converted = Number(value);
  return Number.isNaN(converted) ? fallback : converted;
}

export function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getVideoExtension(commandId: string, inputPath: string, targetFormat: string): string {
  if (
    (commandId === "video_convert" || commandId === "video_screenshot" || commandId === "video_merge") &&
    targetFormat
  ) {
    return targetFormat;
  }
  if (commandId === "video_gif") {
    return "gif";
  }
  return extname(inputPath).replace(".", "");
}
