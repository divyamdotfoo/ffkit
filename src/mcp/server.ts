import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerSkeletonTools } from "./tools.ts";

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "ffkity",
    version: "0.0.1",
  });

  registerSkeletonTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
