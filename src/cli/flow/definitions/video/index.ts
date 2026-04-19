import { getVideoConvertExecutionParams, getVideoConvertSteps } from "./convert.ts";
import { getVideoGifExecutionParams, getVideoGifSteps } from "./gif.ts";
import { getVideoMergeExecutionParams, getVideoMergeSteps } from "./merge.ts";
import { getVideoScreenshotExecutionParams, getVideoScreenshotSteps } from "./screenshot.ts";
import { getVideoSpeedExecutionParams, getVideoSpeedSteps } from "./speed.ts";
import { getVideoTrimExecutionParams, getVideoTrimSteps } from "./trim.ts";
import type { FlowStep } from "../../types.ts";

export function getVideoFlowSteps(): FlowStep[] {
  return [
    ...getVideoConvertSteps(),
    ...getVideoTrimSteps(),
    ...getVideoMergeSteps(),
    ...getVideoSpeedSteps(),
    ...getVideoScreenshotSteps(),
    ...getVideoGifSteps(),
  ];
}

export function getVideoExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  const commandId = typeof values.commandId === "string" ? values.commandId : "";
  if (commandId === "video_convert") {
    return getVideoConvertExecutionParams(values);
  }
  if (commandId === "video_trim") {
    return getVideoTrimExecutionParams(values);
  }
  if (commandId === "video_merge") {
    return getVideoMergeExecutionParams(values);
  }
  if (commandId === "video_speed") {
    return getVideoSpeedExecutionParams(values);
  }
  if (commandId === "video_screenshot") {
    return getVideoScreenshotExecutionParams(values);
  }
  if (commandId === "video_gif") {
    return getVideoGifExecutionParams(values);
  }
  return {};
}
