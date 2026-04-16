import { dirname, extname, join, parse } from "node:path";

import type { FlowState } from "../../types.ts";

export function getAudioOutputPath(state: FlowState): string {
  const inputPath = asString(state.values.inputPath);
  const outputPath = asString(state.values.outputPath);
  if (outputPath) {
    return outputPath;
  }
  if (!inputPath) {
    return "";
  }
  const commandId = asString(state.values.commandId);
  const targetFormat = asString(state.values.targetFormat);
  const parsed = parse(inputPath);
  const dir = dirname(inputPath);
  const extension =
    commandId === "audio_convert" && targetFormat
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
