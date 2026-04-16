export type Category = "image" | "audio" | "video";

export type ParameterType = "string" | "number" | "enum" | "file";

export interface CommandParameter {
  key: string;
  label: string;
  type: ParameterType;
  required: boolean;
  description: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface BuildFfmpegArgsInput {
  inputPath: string;
  outputPath: string;
  params: Record<string, unknown>;
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
