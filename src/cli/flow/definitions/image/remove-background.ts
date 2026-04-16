import type { FlowStep } from "../../types.ts";
import { asNumber, asString, getImageOutputPath } from "./shared.ts";

export function getImageRemoveBackgroundSteps(): FlowStep[] {
  return [
    {
      id: "image_remove_background.inputPath",
      type: "file",
      title: "Input image file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose image file for background removal",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "image_remove_background.keyColor",
    },
    {
      id: "image_remove_background.keyColor",
      type: "text",
      title: "Background color to remove",
      helpText: "Examples: #00FF00, 0x00FF00, black.",
      valueKey: "keyColor",
      required: true,
      defaultValue: () => "#00FF00",
      resolveNextStepId: () => "image_remove_background.similarity",
    },
    {
      id: "image_remove_background.similarity",
      type: "number",
      title: "Similarity (0.01 - 1)",
      valueKey: "similarity",
      min: 0.01,
      max: 1,
      defaultValue: () => "0.2",
      resolveNextStepId: () => "image_remove_background.blend",
    },
    {
      id: "image_remove_background.blend",
      type: "number",
      title: "Blend (0 - 1)",
      valueKey: "blend",
      min: 0,
      max: 1,
      defaultValue: () => "0.05",
      resolveNextStepId: () => "image_remove_background.outputPath",
    },
    {
      id: "image_remove_background.outputPath",
      type: "text",
      title: "Output image path (optional)",
      helpText: "Press Enter to use generated default output path.",
      valueKey: "outputPath",
      required: false,
      defaultValue: (state) => getImageOutputPath(state),
      resolveNextStepId: () => "media.execute",
    },
  ];
}

export function getImageRemoveBackgroundExecutionParams(
  values: Record<string, unknown>,
): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    keyColor: asString(values.keyColor) || "#00FF00",
    similarity: asNumber(values.similarity, 0.2),
    blend: asNumber(values.blend, 0.05),
  };
}
