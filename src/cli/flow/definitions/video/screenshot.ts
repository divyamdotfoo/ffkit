import type { FlowStep } from "../../types.ts";
import { asNumber, asString, getVideoOutputPath } from "./shared.ts";

export function getVideoScreenshotSteps(): FlowStep[] {
  return [
    {
      id: "video_screenshot.inputPath",
      type: "file",
      title: "Input video file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose video file for screenshot",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "video_screenshot.timestampSeconds",
    },
    {
      id: "video_screenshot.timestampSeconds",
      type: "number",
      title: "Screenshot timestamp (seconds)",
      helpText: "Enter where to grab the frame.",
      valueKey: "timestampSeconds",
      min: 0,
      defaultValue: () => "1",
      resolveNextStepId: () => "video_screenshot.targetFormat",
    },
    {
      id: "video_screenshot.targetFormat",
      type: "select",
      title: "Screenshot format",
      valueKey: "targetFormat",
      options: [
        { label: "png", value: "png" },
        { label: "jpg", value: "jpg" },
        { label: "webp", value: "webp" },
      ],
      resolveNextStepId: () => "video_screenshot.outputPath",
    },
    {
      id: "video_screenshot.outputPath",
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

export function getVideoScreenshotExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    timestampSeconds: asNumber(values.timestampSeconds, 1),
    targetFormat: asString(values.targetFormat) || "png",
  };
}
