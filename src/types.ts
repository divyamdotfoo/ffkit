export type Category = "image" | "audio" | "video";

export type ParameterType = "string" | "number" | "enum" | "file" | "paths";

export interface CommandParameter {
  key: string;
  label: string;
  type: ParameterType;
  required: boolean;
  description: string;
  options?: string[];
  min?: number;
  max?: number;
  /** Minimum number of paths when `type` is `"paths"`. */
  minItems?: number;
}

export interface BuildFfmpegArgsInput {
  inputPath: string;
  outputPath: string;
  params: Record<string, unknown>;
  /** Populated by the executor for concat-demuxer commands (e.g. `video_merge`). */
  concatListPath?: string;
}

export interface CommandDescriptor {
  id: string;
  category: Category;
  name: string;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
  parameters: CommandParameter[];
  buildFfmpegArgs: (input: BuildFfmpegArgsInput) => string[];
}
