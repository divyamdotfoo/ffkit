import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { listCommands, listCommandsByCategory } from "../core/command-registry.ts";
import { executeCommand } from "../core/executor.ts";
import { toPublicCommand } from "../core/public-command.ts";
import { buildExecuteToolInputSchema, buildToolDescription } from "./command-input-schema.ts";

const listCommandsCategorySchema = z.enum(["image", "audio", "video"]);

export function registerMcpTools(server: McpServer) {
  server.registerTool(
    "ping",
    {
      description: "Returns pong. Used to verify MCP wiring.",
    },
    async () => ({
      content: [{ type: "text", text: "pong" }],
    }),
  );

  server.registerTool(
    "list_commands",
    {
      title: "List ffmpeg commands",
      description:
        "Returns a JSON array of command metadata (id, category, parameters, supported formats). Use optional category to filter.",
      inputSchema: z.object({
        category: listCommandsCategorySchema
          .optional()
          .describe('Filter: "image", "audio", or "video". Omit to return all commands.'),
      }),
    },
    async (args) => {
      const commands =
        args.category !== undefined ? listCommandsByCategory(args.category) : listCommands();
      const payload = commands.map(toPublicCommand);
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
      };
    },
  );

  for (const command of listCommands()) {
    server.registerTool(
      command.id,
      {
        title: command.name,
        description: buildToolDescription(command),
        inputSchema: buildExecuteToolInputSchema(command),
      },
      async (args) => {
        const result = await executeCommand(command, args as Record<string, unknown>);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
          isError: !result.success,
        };
      },
    );
  }
}
