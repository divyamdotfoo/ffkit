import { AUDIO_ENCODING_MODE_FLOW_OPTIONS } from "../../../../core/audio-encoding-profile.ts";
import type { FlowState, FlowStep } from "../../types.ts";
import { asString, getVideoOutputPath } from "./shared.ts";

export function getVideoExtractAudioSteps(): FlowStep[] {
  return [
    {
      id: "video_extract_audio.inputPath",
      type: "file",
      title: "Input video file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose video to extract audio from",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "video_extract_audio.targetFormat",
    },
    {
      id: "video_extract_audio.targetFormat",
      type: "select",
      title: "Output audio format",
      valueKey: "targetFormat",
      options: [
        { label: "mp3", value: "mp3" },
        { label: "wav", value: "wav" },
        { label: "aac", value: "aac" },
        { label: "m4a", value: "m4a" },
        { label: "ogg", value: "ogg" },
        { label: "flac", value: "flac" },
      ],
      resolveNextStepId: () => "video_extract_audio.qualityProfile",
    },
    {
      id: "video_extract_audio.qualityProfile",
      type: "select",
      title: "Quality profile",
      valueKey: "qualityProfile",
      options: [
        { label: "smaller-file", value: "smaller-file" },
        { label: "balanced", value: "balanced" },
        { label: "higher-quality", value: "higher-quality" },
      ],
      resolveNextStepId: () => "video_extract_audio.encodingMode",
    },
    {
      id: "video_extract_audio.encodingMode",
      type: "select",
      title: "Encoding mode",
      valueKey: "encodingMode",
      options: [...AUDIO_ENCODING_MODE_FLOW_OPTIONS],
      resolveNextStepId: () => "video_extract_audio.outputPath",
    },
    {
      id: "video_extract_audio.outputPath",
      type: "text",
      title: "Output file path (optional)",
      helpText: "Press Enter to use generated default output path.",
      valueKey: "outputPath",
      required: false,
      defaultValue: (state: FlowState) => getVideoOutputPath(state),
      resolveNextStepId: () => "media.execute",
    },
  ];
}

export function getVideoExtractAudioExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    targetFormat: asString(values.targetFormat) || "mp3",
    qualityProfile: asString(values.qualityProfile) || "balanced",
    encodingMode: asString(values.encodingMode) || "compatible",
  };
}
