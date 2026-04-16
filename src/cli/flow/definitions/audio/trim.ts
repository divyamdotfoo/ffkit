import type { FlowStep } from "../../types.ts";
import { asNumber, asString, getAudioOutputPath } from "./shared.ts";

export function getAudioTrimSteps(): FlowStep[] {
  return [
    {
      id: "audio_trim.inputPath",
      type: "file",
      title: "Input audio file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose audio file to trim",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "audio_trim.startSeconds",
    },
    {
      id: "audio_trim.startSeconds",
      type: "number",
      title: "Trim start time (seconds)",
      helpText: "Use a numeric value, e.g. 12.5",
      valueKey: "startSeconds",
      min: 0,
      defaultValue: () => "0",
      resolveNextStepId: () => "audio_trim.durationSeconds",
    },
    {
      id: "audio_trim.durationSeconds",
      type: "number",
      title: "Trim duration (seconds)",
      helpText: "Use a numeric value, e.g. 30",
      valueKey: "durationSeconds",
      min: 0.1,
      defaultValue: () => "30",
      resolveNextStepId: () => "audio_trim.outputPath",
    },
    {
      id: "audio_trim.outputPath",
      type: "text",
      title: "Output file path (optional)",
      helpText: "Press Enter to use generated default output path.",
      valueKey: "outputPath",
      required: false,
      defaultValue: (state) => getAudioOutputPath(state),
      resolveNextStepId: () => "media.execute",
    },
  ];
}

export function getAudioTrimExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    startSeconds: asNumber(values.startSeconds, 0),
    durationSeconds: asNumber(values.durationSeconds, 30),
  };
}
