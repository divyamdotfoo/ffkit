import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMcpTools(server: McpServer) {
  server.registerTool(
    "ping",
    {
      description: "Returns pong. Used to verify MCP wiring.",
    },
    async () => ({
      content: [{ type: "text", text: "pong" }],
    })
  );
}
