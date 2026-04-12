import { allCommandDescriptors } from "../commands/index.ts";
import type { Category, CommandDescriptor } from "../types.ts";

export function listCommands(): CommandDescriptor[] {
  return allCommandDescriptors;
}

export function listCommandsByCategory(category: Category): CommandDescriptor[] {
  return allCommandDescriptors.filter((command) => command.category === category);
}

export function getCommand(id: string): CommandDescriptor | undefined {
  return allCommandDescriptors.find((command) => command.id === id);
}
