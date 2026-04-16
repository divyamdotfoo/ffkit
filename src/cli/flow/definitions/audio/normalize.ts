import type { FlowStep } from "../../types.ts";
import { asString, getAudioOutputPath } from "./shared.ts";

export function getAudioNormalizeSteps(): FlowStep[] {
  return [
    {
      id: "audio_normalize.inputPath",
      type: "file",
      title: "Input audio file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose audio file to normalize",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "audio_normalize.strength",
    },
    {
      id: "audio_normalize.strength",
      type: "select",
      title: "Normalization strength",
      valueKey: "strength",
      options: [
        { label: "light", value: "light" },
        { label: "standard", value: "standard" },
        { label: "strong", value: "strong" },
      ],
      resolveNextStepId: () => "audio_normalize.outputPath",
    },
    {
      id: "audio_normalize.outputPath",
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

export function getAudioNormalizeExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    strength: asString(values.strength) || "standard",
  };
}
