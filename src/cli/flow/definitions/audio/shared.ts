import { dirname, extname, join, parse } from "node:path";

import type { FlowState } from "../../types.ts";

export function getAudioOutputPath(state: FlowState): string {
  const commandId = asString(state.values.commandId);
  const mergeOrdered =
    commandId === "audio_merge" && Array.isArray(state.values.audioMergeOrderedPaths)
      ? state.values.audioMergeOrderedPaths.filter(
          (path): path is string => typeof path === "string" && path.length > 0,
        )
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
  const extension =
    (commandId === "audio_convert" || commandId === "audio_merge" || commandId === "audio_remove_silence") &&
    targetFormat
      ? targetFormat
      : extname(inputPath).replace(".", "");
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
