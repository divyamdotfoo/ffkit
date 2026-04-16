import type { FlowStep } from "../../types.ts";
import { asString, getVideoOutputPath } from "./shared.ts";

export function getVideoConvertSteps(): FlowStep[] {
  return [
    {
      id: "video_convert.inputPath",
      type: "file",
      title: "Input video file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose video file to convert",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "video_convert.targetFormat",
    },
    {
      id: "video_convert.targetFormat",
      type: "select",
      title: "Target format",
      valueKey: "targetFormat",
      options: [
        { label: "mp4", value: "mp4" },
        { label: "mov", value: "mov" },
        { label: "mkv", value: "mkv" },
        { label: "avi", value: "avi" },
        { label: "webm", value: "webm" },
        { label: "m4v", value: "m4v" },
      ],
      resolveNextStepId: () => "video_convert.outputPath",
    },
    {
      id: "video_convert.outputPath",
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

export function getVideoConvertExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    targetFormat: asString(values.targetFormat) || "mp4",
  };
}
