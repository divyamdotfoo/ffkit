import type { FlowStep } from "../../types.ts";
import { asString, getImageOutputPath } from "./shared.ts";

export function getImageConvertSteps(): FlowStep[] {
  return [
    {
      id: "image_convert.inputPath",
      type: "file",
      title: "Input image file",
      helpText: "Press Enter to open native file picker, O to retry, or paste path.",
      pickerTitle: "Choose image file to convert",
      valueKey: "inputPath",
      required: true,
      resolveNextStepId: () => "image_convert.targetFormat",
    },
    {
      id: "image_convert.targetFormat",
      type: "select",
      title: "Target format",
      valueKey: "targetFormat",
      options: [
        { label: "png", value: "png" },
        { label: "jpg", value: "jpg" },
        { label: "jpeg", value: "jpeg" },
        { label: "webp", value: "webp" },
        { label: "bmp", value: "bmp" },
        { label: "tiff", value: "tiff" },
      ],
      resolveNextStepId: () => "image_convert.outputPath",
    },
    {
      id: "image_convert.outputPath",
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

export function getImageConvertExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  return {
    inputPath: asString(values.inputPath),
    outputPath: asString(values.outputPath),
    targetFormat: asString(values.targetFormat) || "webp",
  };
}
