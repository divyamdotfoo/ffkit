import type { CommandDescriptor } from "../../types.ts";

export const imageCommands: CommandDescriptor[] = [
  {
    id: "image_resize",
    category: "image",
    name: "Resize image",
    description: "Resize with fit/fill/stretch behavior and optional background fill.",
    inputFormats: ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
    outputFormats: ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
    parameters: [
      {
        key: "width",
        label: "Width",
        type: "number",
        required: true,
        description: "Output width in pixels.",
        min: 1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        required: true,
        description: "Output height in pixels.",
        min: 1,
      },
      {
        key: "resizeMode",
        label: "Resize mode",
        type: "enum",
        required: true,
        description: "How the source fits target dimensions.",
        options: ["fit", "fill", "stretch"],
      },
      {
        key: "fillColor",
        label: "Fill color",
        type: "string",
        required: false,
        description: "Padding color for fit mode, e.g. black or #ffffff.",
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const width = getNumberParam(params.width, 1280);
      const height = getNumberParam(params.height, 720);
      const resizeMode = String(params.resizeMode ?? "fit");
      const fillColor = String(params.fillColor ?? "").trim() || "black";
      return [
        "-i",
        inputPath,
        "-vf",
        buildResizeFilter(width, height, resizeMode, fillColor),
        outputPath,
      ];
    },
  },
  {
    id: "image_remove_background",
    category: "image",
    name: "Remove background (solid color)",
    description: "Remove near-solid background color using FFmpeg color keying.",
    inputFormats: ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
    outputFormats: ["png", "webp"],
    parameters: [
      {
        key: "keyColor",
        label: "Background color",
        type: "string",
        required: true,
        description: "Color to remove, e.g. 0x00FF00 or #00FF00.",
      },
      {
        key: "similarity",
        label: "Similarity",
        type: "number",
        required: true,
        description: "How close colors are matched to key color.",
        min: 0.01,
        max: 1,
      },
      {
        key: "blend",
        label: "Blend",
        type: "number",
        required: true,
        description: "Soft edge blending around removed areas.",
        min: 0,
        max: 1,
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const keyColor = String(params.keyColor ?? "#00FF00");
      const similarity = getNumberParam(params.similarity, 0.2);
      const blend = getNumberParam(params.blend, 0.05);
      return [
        "-i",
        inputPath,
        "-vf",
        `colorkey=${normalizeHexColor(keyColor)}:${similarity}:${blend}`,
        outputPath,
      ];
    },
  },
  {
    id: "image_convert",
    category: "image",
    name: "Convert format",
    description: "Convert image format to another extension.",
    inputFormats: ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
    outputFormats: ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
    parameters: [
      {
        key: "targetFormat",
        label: "Target format",
        type: "enum",
        required: true,
        description: "Output file extension/format.",
        options: ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath }) => {
      return ["-i", inputPath, outputPath];
    },
  },
];

function buildResizeFilter(
  width: number,
  height: number,
  resizeMode: string,
  fillColor: string,
): string {
  if (resizeMode === "stretch") {
    return `scale=${width}:${height}`;
  }
  if (resizeMode === "fill") {
    return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
  }
  return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:${fillColor}`;
}

function getNumberParam(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  const converted = Number(value);
  if (Number.isNaN(converted)) {
    return fallback;
  }
  return converted;
}

function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) {
    return `0x${trimmed.slice(1)}`;
  }
  return trimmed;
}
