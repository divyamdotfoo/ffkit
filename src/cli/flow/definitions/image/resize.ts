import type { FlowStep } from "../../types.ts";
import { asNumber, asString, getImageOutputPath } from "./shared.ts";

export function getImageResizeSteps(): FlowStep[] {
  return [
    {
      id: "image_resize.inputPath",
      type: "file",
      title: "Input image file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose image file to resize",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "image_resize.width",
    },
    {
      id: "image_resize.width",
      type: "number",
      title: "Target width (px)",
      valueKey: "width",
      min: 1,
      defaultValue: () => "1280",
      resolveNextStepId: () => "image_resize.height",
    },
    {
      id: "image_resize.height",
      type: "number",
      title: "Target height (px)",
      valueKey: "height",
      min: 1,
      defaultValue: () => "720",
      resolveNextStepId: () => "image_resize.resizeMode",
    },
    {
      id: "image_resize.resizeMode",
      type: "select",
      title: "Resize mode",
      valueKey: "resizeMode",
      options: [
        { label: "fit", value: "fit", nextStepId: "image_resize.fillColor" },
        { label: "fill", value: "fill", nextStepId: "image_resize.outputPath" },
        { label: "stretch", value: "stretch", nextStepId: "image_resize.outputPath" },
      ],
    },
    {
      id: "image_resize.fillColor",
      type: "text",
      title: "Fill color (fit mode)",
      helpText: "Used for extra canvas area, e.g. black, white, #222222.",
      valueKey: "fillColor",
      required: false,
      defaultValue: () => "black",
      resolveNextStepId: () => "image_resize.outputPath",
    },
    {
      id: "image_resize.outputPath",
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

export function getImageResizeExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    width: asNumber(values.width, 1280),
    height: asNumber(values.height, 720),
    resizeMode: asString(values.resizeMode) || "fit",
    fillColor: asString(values.fillColor) || "black",
  };
}
