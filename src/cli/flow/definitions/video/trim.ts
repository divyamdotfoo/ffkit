import type { FlowStep } from "../../types.ts";
import { asString, getVideoOutputPath } from "./shared.ts";

export function getVideoTrimSteps(): FlowStep[] {
  return [
    {
      id: "video_trim.inputPath",
      type: "file",
      title: "Input video file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose video file to trim",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "video_trim.startTimestamp",
    },
    {
      id: "video_trim.startTimestamp",
      type: "text",
      title: "Start timestamp (HH:MM:SS)",
      helpText: "Inclusive start, e.g. 00:00:10 or 1:05:00.5",
      valueKey: "startTimestamp",
      required: true,
      defaultValue: () => "00:00:00",
      resolveNextStepId: () => "video_trim.endTimestamp",
    },
    {
      id: "video_trim.endTimestamp",
      type: "text",
      title: "End timestamp (HH:MM:SS)",
      helpText: "Must be after start, e.g. 00:05:30",
      valueKey: "endTimestamp",
      required: true,
      resolveNextStepId: () => "video_trim.outputPath",
    },
    {
      id: "video_trim.outputPath",
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

export function getVideoTrimExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    startTimestamp: asString(values.startTimestamp),
    endTimestamp: asString(values.endTimestamp),
  };
}
