import type { Category, CommandDescriptor, CommandParameter } from "../types.ts";

export interface PublicCommand {
  id: string;
  category: Category;
  name: string;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
  parameters: CommandParameter[];
}

export function toPublicCommand(command: CommandDescriptor): PublicCommand {
  const { id, category, name, description, inputFormats, outputFormats, parameters } = command;
  return { id, category, name, description, inputFormats, outputFormats, parameters };
}
