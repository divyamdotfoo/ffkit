import type { FlowStep } from "../../types.ts";
import { asNumber, asString, getVideoOutputPath } from "./shared.ts";

export function getVideoSpeedSteps(): FlowStep[] {
  return [
    {
      id: "video_speed.inputPath",
      type: "file",
      title: "Input video file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose video file to retime",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "video_speed.speedMultiplier",
    },
    {
      id: "video_speed.speedMultiplier",
      type: "number",
      title: "Speed multiplier",
      helpText: "Enter a number like 1, 1.25, 1.5, 2.",
      valueKey: "speedMultiplier",
      min: 0.25,
      max: 4,
      defaultValue: () => "1.25",
      resolveNextStepId: () => "video_speed.outputPath",
    },
    {
      id: "video_speed.outputPath",
      type: "text",
      title: "Output file path (optional)",
      helpText: "Press Enter to use generated default output path.",
      valueKey: "outputPath",
      required: false,
      defaultValue: (state) => getVideoOutputPath(state),
      resolveNextStepId: () => "media.execute",
    },
  ];
}

export function getVideoSpeedExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    speedMultiplier: asNumber(values.speedMultiplier, 1.25),
  };
}
