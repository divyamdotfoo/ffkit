import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSkeletonTools(server: McpServer) {
  server.registerTool(
    "ping",
    {
      description: "Returns pong. Used to verify MCP wiring (skeleton).",
    },
    async () => ({
      content: [{ type: "text", text: "pong" }],
    })
  );
}
