import { audioCommands } from "./audio/index.ts";
import { imageCommands } from "./image/index.ts";
import { videoCommands } from "./video/index.ts";
import type { CommandDescriptor } from "../types.ts";

export const allCommandDescriptors: CommandDescriptor[] = [
  ...imageCommands,
  ...audioCommands,
  ...videoCommands,
];
