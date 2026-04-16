import type { CommandDescriptor } from "../../types.ts";

export const videoCommands: CommandDescriptor[] = [
  {
    id: "video_placeholder",
    category: "video",
    name: "Video (placeholder)",
    description: "Reserved for future video operations (trim, convert, …).",
    inputFormats: [],
    outputFormats: [],
    parameters: [],
    buildFfmpegArgs: () => {
      throw new Error("Video placeholder cannot be executed.");
    },
  },
];
