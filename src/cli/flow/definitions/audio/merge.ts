import { basename as pathBasename } from "node:path";

import type { FlowState, FlowStep, SelectOption } from "../../types.ts";
import { asString, getAudioOutputPath } from "./shared.ts";

export function getAudioMergeSteps(): FlowStep[] {
  return [
    {
      id: "audio_merge.inputPath",
      type: "file",
      title: "Audio clips to merge",
      helpText:
        "Choose multiple files at once in the picker, or paste paths (one per line or separated by |).",
      pickerTitle: "Choose audio files to merge",
      valueKey: "audioMergeCandidatePaths",
      multiSelect: true,
      minFiles: 2,
      multiSelectOrderResetKeys: ["audioMergeOrderedPaths"],
      resolveNextStepId: () => "audio_merge.orderPick",
    },
    {
      id: "audio_merge.orderPick",
      type: "select",
      title: "Order clips",
      helpText: "Choose the next clip in playback order.",
      options: [],
      resolveDynamicOptions: (state: FlowState) => remainingAudioMergeOptions(state),
      resolveDynamicTitle: (state: FlowState) => {
        const total = asPathArray(state.values.audioMergeCandidatePaths).length;
        const ordered = asPathArray(state.values.audioMergeOrderedPaths).length;
        return `Choose clip ${ordered + 1} of ${total}`;
      },
      resolveDynamicHelpText: (state: FlowState) => {
        const ordered = asPathArray(state.values.audioMergeOrderedPaths);
        if (ordered.length === 0) {
          return "Select which file plays first.";
        }
        return `Order so far: ${ordered.map(clipLabel).join(" → ")}`;
      },
      accumulateSelectionToKey: "audioMergeOrderedPaths",
      resolveNextStepId: (_value: string, flowState: FlowState) => {
        const candidates = asPathArray(flowState.values.audioMergeCandidatePaths);
        const ordered = asPathArray(flowState.values.audioMergeOrderedPaths);
        if (ordered.length < candidates.length) {
          return "audio_merge.orderPick";
        }
        return "audio_merge.targetFormat";
      },
    },
    {
      id: "audio_merge.targetFormat",
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
      resolveNextStepId: () => "audio_merge.qualityProfile",
    },
    {
      id: "audio_merge.qualityProfile",
      type: "select",
      title: "Quality profile",
      valueKey: "qualityProfile",
      options: [
        { label: "smaller-file", value: "smaller-file" },
        { label: "balanced", value: "balanced" },
        { label: "higher-quality", value: "higher-quality" },
      ],
      resolveNextStepId: () => "audio_merge.encodingMode",
    },
    {
      id: "audio_merge.encodingMode",
      type: "select",
      title: "Encoding mode",
      valueKey: "encodingMode",
      options: [
        { label: "compatible", value: "compatible" },
        { label: "efficient", value: "efficient" },
      ],
      resolveNextStepId: () => "audio_merge.outputPath",
    },
    {
      id: "audio_merge.outputPath",
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

export function getAudioMergeExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  const ordered = asPathArray(values.audioMergeOrderedPaths);
  return {
    inputPaths: ordered,
    outputPath: asString(values.outputPath),
    targetFormat: asString(values.targetFormat) || "mp3",
    qualityProfile: asString(values.qualityProfile) || "balanced",
    encodingMode: asString(values.encodingMode) || "compatible",
  };
}

function asPathArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function clipLabel(path: string): string {
  const base = pathBasename(path);
  return base || path;
}

function remainingAudioMergeOptions(state: FlowState): SelectOption[] {
  const candidates = asPathArray(state.values.audioMergeCandidatePaths);
  const ordered = asPathArray(state.values.audioMergeOrderedPaths);
  return candidates
    .filter((path) => !ordered.includes(path))
    .map((path) => ({
      label: clipLabel(path),
      value: path,
      description: path.length > 72 ? `…${path.slice(-68)}` : path,
    }));
}
