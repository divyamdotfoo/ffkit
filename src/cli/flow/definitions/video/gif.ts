import type { FlowStep } from "../../types.ts";
import { asNumber, asString, getVideoOutputPath } from "./shared.ts";

export function getVideoGifSteps(): FlowStep[] {
  return [
    {
      id: "video_gif.inputPath",
      type: "file",
      title: "Input video file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose video file for GIF",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "video_gif.rangeMode",
    },
    {
      id: "video_gif.rangeMode",
      type: "select",
      title: "GIF range",
      valueKey: "rangeMode",
      options: [
        { label: "full", value: "full", nextStepId: "video_gif.outputPath" },
        { label: "segment", value: "segment", nextStepId: "video_gif.startSeconds" },
      ],
    },
    {
      id: "video_gif.startSeconds",
      type: "number",
      title: "Segment start (seconds)",
      valueKey: "startSeconds",
      min: 0,
      defaultValue: () => "0",
      resolveNextStepId: () => "video_gif.endSeconds",
    },
    {
      id: "video_gif.endSeconds",
      type: "number",
      title: "Segment end (seconds)",
      valueKey: "endSeconds",
      min: 0.1,
      defaultValue: () => "5",
      resolveNextStepId: () => "video_gif.outputPath",
    },
    {
      id: "video_gif.outputPath",
      type: "text",
      title: "Output GIF path (optional)",
      helpText: "Press Enter to use generated default output path.",
      valueKey: "outputPath",
      required: false,
      defaultValue: (state) => getVideoOutputPath(state),
      resolveNextStepId: () => "media.execute",
    },
  ];
}

export function getVideoGifExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    rangeMode: asString(values.rangeMode) || "full",
    startSeconds: asNumber(values.startSeconds, 0),
    endSeconds: asNumber(values.endSeconds, 5),
  };
}
