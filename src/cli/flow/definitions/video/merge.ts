import { basename as pathBasename } from "node:path";

import type { FlowState, FlowStep, SelectOption } from "../../types.ts";
import { asString, getVideoOutputPath } from "./shared.ts";

export function getVideoMergeSteps(): FlowStep[] {
  return [
    {
      id: "video_merge.inputPath",
      type: "file",
      title: "Video clips to merge",
      helpText:
        "Choose multiple files at once in the picker, or paste paths (one per line or separated by |).",
      pickerTitle: "Choose video files to merge",
      valueKey: "mergeCandidatePaths",
      multiSelect: true,
      minFiles: 2,
      multiSelectOrderResetKeys: ["mergeOrderedPaths"],
      resolveNextStepId: () => "video_merge.orderPick",
    },
    {
      id: "video_merge.orderPick",
      type: "select",
      title: "Order clips",
      helpText: "Choose the next clip in playback order.",
      options: [],
      resolveDynamicOptions: (state: FlowState) => remainingMergeOptions(state),
      resolveDynamicTitle: (state: FlowState) => {
        const total = asPathArray(state.values.mergeCandidatePaths).length;
        const ordered = asPathArray(state.values.mergeOrderedPaths).length;
        return `Choose clip ${ordered + 1} of ${total}`;
      },
      resolveDynamicHelpText: (state: FlowState) => {
        const ordered = asPathArray(state.values.mergeOrderedPaths);
        if (ordered.length === 0) {
          return "Select which file plays first.";
        }
        return `Order so far: ${ordered.map(clipLabel).join(" → ")}`;
      },
      accumulateSelectionToKey: "mergeOrderedPaths",
      resolveNextStepId: (_value: string, flowState: FlowState) => {
        const candidates = asPathArray(flowState.values.mergeCandidatePaths);
        const ordered = asPathArray(flowState.values.mergeOrderedPaths);
        if (ordered.length < candidates.length) {
          return "video_merge.orderPick";
        }
        return "video_merge.targetFormat";
      },
    },
    {
      id: "video_merge.targetFormat",
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
      resolveNextStepId: () => "video_merge.outputPath",
    },
    {
      id: "video_merge.outputPath",
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

export function getVideoMergeExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  const ordered = asPathArray(values.mergeOrderedPaths);
  return {
    inputPaths: ordered,
    outputPath: asString(values.outputPath),
    targetFormat: asString(values.targetFormat) || "mp4",
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

function remainingMergeOptions(state: FlowState): SelectOption[] {
  const candidates = asPathArray(state.values.mergeCandidatePaths);
  const ordered = asPathArray(state.values.mergeOrderedPaths);
  return candidates
    .filter((path) => !ordered.includes(path))
    .map((path) => ({
      label: clipLabel(path),
      value: path,
      description: path.length > 72 ? `…${path.slice(-68)}` : path,
    }));
}
