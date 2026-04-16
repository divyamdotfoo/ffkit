import type { CommandDescriptor } from "../../types.ts";

export const imageCommands: CommandDescriptor[] = [
  {
    id: "image_placeholder",
    category: "image",
    name: "Image (placeholder)",
    description: "Reserved for future image operations (resize, crop, …).",
    inputFormats: [],
    outputFormats: [],
    parameters: [],
    buildFfmpegArgs: () => {
      throw new Error("Image placeholder cannot be executed.");
    },
  },
];
