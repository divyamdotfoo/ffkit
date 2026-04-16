import type { FlowStep } from "../../types.ts";
import { asString, getAudioOutputPath } from "./shared.ts";

export function getAudioConvertSteps(): FlowStep[] {
  return [
    {
      id: "audio_convert.inputPath",
      type: "file",
      title: "Input audio file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose audio file to convert",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "audio_convert.targetFormat",
    },
    {
      id: "audio_convert.targetFormat",
      type: "select",
      title: "Target format",
      valueKey: "targetFormat",
      options: [
        { label: "mp3", value: "mp3" },
        { label: "wav", value: "wav" },
        { label: "aac", value: "aac" },
        { label: "m4a", value: "m4a" },
        { label: "ogg", value: "ogg" },
        { label: "flac", value: "flac" },
      ],
      resolveNextStepId: () => "audio_convert.qualityProfile",
    },
    {
      id: "audio_convert.qualityProfile",
      type: "select",
      title: "Quality profile",
      valueKey: "qualityProfile",
      options: [
        { label: "smaller-file", value: "smaller-file" },
        { label: "balanced", value: "balanced" },
        { label: "higher-quality", value: "higher-quality" },
      ],
      resolveNextStepId: () => "audio_convert.encodingMode",
    },
    {
      id: "audio_convert.encodingMode",
      type: "select",
      title: "Encoding mode",
      valueKey: "encodingMode",
      options: [
        { label: "compatible", value: "compatible" },
        { label: "efficient", value: "efficient" },
      ],
      resolveNextStepId: () => "audio_convert.outputPath",
    },
    {
      id: "audio_convert.outputPath",
      type: "text",
      title: "Output file path (optional)",
      helpText: "Press Enter to use generated default output path.",
      valueKey: "outputPath",
      required: false,
      defaultValue: (state) => getAudioOutputPath(state),
      resolveNextStepId: () => "audio.execute",
    },
  ];
}

export function getAudioConvertExecutionParams(
  values: Record<string, unknown>
): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    targetFormat: asString(values.targetFormat) || "mp3",
    qualityProfile: asString(values.qualityProfile) || "balanced",
    encodingMode: asString(values.encodingMode) || "compatible",
  };
}
