import { z } from "zod";

import type { CommandDescriptor, CommandParameter } from "../types.ts";

export function buildExecuteToolInputSchema(command: CommandDescriptor): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const usesInputPaths = commandUsesInputPathsParam(command);
  const shape: Record<string, z.ZodTypeAny> = {
    outputPath: z
      .string()
      .describe("Server-local path where FFmpeg will write the output (parent directory should exist or be creatable)."),
  };
  if (!usesInputPaths) {
    shape.inputPath = z
      .string()
      .describe("Server-local path to the input file (must exist on the machine running ffkity).");
  }
  for (const parameter of command.parameters) {
    shape[parameter.key] = parameterToZod(parameter);
  }
  return z.object(shape);
}

export function buildToolDescription(command: CommandDescriptor): string {
  const formats = `Input extensions: ${command.inputFormats.join(", ")}. Output extensions: ${command.outputFormats.join(", ")}.`;
  const pathHint = commandUsesInputPathsParam(command)
    ? "Parameters inputPaths (array of server-local paths) and outputPath match the ffkity HTTP API."
    : "Paths inputPath and outputPath are server-local filesystem paths, same as the ffkity HTTP API.";
  return `${command.name}. ${command.description} ${formats} ${pathHint}`;
}

function commandUsesInputPathsParam(command: CommandDescriptor): boolean {
  return command.parameters.some((parameter) => parameter.type === "paths" && parameter.key === "inputPaths");
}

function parameterDescribe(parameter: CommandParameter): string {
  const parts = [parameter.label, parameter.description].filter((s) => s && s.length > 0);
  return parts.join(" — ");
}

function parameterToZod(parameter: CommandParameter): z.ZodTypeAny {
  const describe = parameterDescribe(parameter);
  let schema: z.ZodTypeAny;

  switch (parameter.type) {
    case "paths": {
      const minItems = typeof parameter.minItems === "number" ? parameter.minItems : 2;
      schema = z.array(z.string()).min(minItems).describe(describe);
      break;
    }
    case "number": {
      let n = z.number().describe(describe);
      if (typeof parameter.min === "number") {
        n = n.min(parameter.min);
      }
      if (typeof parameter.max === "number") {
        n = n.max(parameter.max);
      }
      schema = n;
      break;
    }
    case "enum": {
      const options = parameter.options ?? [];
      if (options.length === 0) {
        schema = z.string().describe(`${describe} (no enum options defined; use a string)`);
      } else if (options.length === 1) {
        const only = options[0];
        if (only === undefined) {
          schema = z.string().describe(describe);
        } else {
          schema = z.literal(only).describe(describe);
        }
      } else {
        const tuple = options as [string, string, ...string[]];
        schema = z.enum(tuple).describe(describe);
      }
      break;
    }
    case "file":
    case "string":
    default:
      schema = z.string().describe(describe);
      break;
  }

  if (!parameter.required) {
    return schema.optional();
  }
  return schema;
}
