import { AUDIO_ENCODING_MODE_FLOW_OPTIONS } from "../../../../core/audio-encoding-profile.ts";
import { SILENCE_REMOVAL_FLOW_OPTIONS } from "../../../../core/audio-silence-presets.ts";
import type { FlowState, FlowStep } from "../../types.ts";
import { asString, getAudioOutputPath } from "./shared.ts";

export function getAudioRemoveSilenceSteps(): FlowStep[] {
  return [
    {
      id: "audio_remove_silence.inputPath",
      type: "file",
      title: "Input audio file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose audio to strip silence from",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "audio_remove_silence.silencePreset",
    },
    {
      id: "audio_remove_silence.silencePreset",
      type: "select",
      title: "How strong should silence removal be?",
      helpText: "Higher levels remove shorter quiet gaps (see each option).",
      valueKey: "silencePreset",
      options: [...SILENCE_REMOVAL_FLOW_OPTIONS],
      resolveNextStepId: () => "audio_remove_silence.targetFormat",
    },
    {
      id: "audio_remove_silence.targetFormat",
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
      resolveNextStepId: () => "audio_remove_silence.qualityProfile",
    },
    {
      id: "audio_remove_silence.qualityProfile",
      type: "select",
      title: "Quality profile",
      valueKey: "qualityProfile",
      options: [
        { label: "smaller-file", value: "smaller-file" },
        { label: "balanced", value: "balanced" },
        { label: "higher-quality", value: "higher-quality" },
      ],
      resolveNextStepId: () => "audio_remove_silence.encodingMode",
    },
    {
      id: "audio_remove_silence.encodingMode",
      type: "select",
      title: "Encoding mode",
      valueKey: "encodingMode",
      options: [...AUDIO_ENCODING_MODE_FLOW_OPTIONS],
      resolveNextStepId: () => "audio_remove_silence.outputPath",
    },
    {
      id: "audio_remove_silence.outputPath",
      type: "text",
      title: "Output file path (optional)",
      helpText: "Press Enter to use generated default output path.",
      valueKey: "outputPath",
      required: false,
      defaultValue: (state: FlowState) => getAudioOutputPath(state),
      resolveNextStepId: () => "media.execute",
    },
  ];
}

export function getAudioRemoveSilenceExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    silencePreset: asString(values.silencePreset) || "level_2",
    targetFormat: asString(values.targetFormat) || "mp3",
    qualityProfile: asString(values.qualityProfile) || "balanced",
    encodingMode: asString(values.encodingMode) || "compatible",
  };
}
