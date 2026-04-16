import { getImageConvertExecutionParams, getImageConvertSteps } from "./convert.ts";
import {
  getImageRemoveBackgroundExecutionParams,
  getImageRemoveBackgroundSteps,
} from "./remove-background.ts";
import { getImageResizeExecutionParams, getImageResizeSteps } from "./resize.ts";
import type { FlowStep } from "../../types.ts";

export function getImageFlowSteps(): FlowStep[] {
  return [
    ...getImageResizeSteps(),
    ...getImageRemoveBackgroundSteps(),
    ...getImageConvertSteps(),
  ];
}

export function getImageExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  const commandId = typeof values.commandId === "string" ? values.commandId : "";
  if (commandId === "image_resize") {
    return getImageResizeExecutionParams(values);
  }
  if (commandId === "image_remove_background") {
    return getImageRemoveBackgroundExecutionParams(values);
  }
  if (commandId === "image_convert") {
    return getImageConvertExecutionParams(values);
  }
  return {};
}
