import { Command } from "commander";
import { render } from "ink";
import React from "react";

import { registerAudioCli } from "./commands/audio/index.ts";
import { registerImageCli } from "./commands/image/index.ts";
import { registerVideoCli } from "./commands/video/index.ts";
import { FlowScreen } from "./flow/screen.tsx";
import { runFfmpegGuard } from "./guards/ffmpeg-guard.ts";
import { startMcpServer } from "../mcp/server.ts";
import { createApp } from "../server/app.ts";

export function createCliProgram(): Command {
  const program = new Command();

  program.hook("preAction", runFfmpegGuard);

  program
    .name("ffkity")
    .description("FFmpeg helper — CLI, HTTP API, and MCP.")
    .version("0.0.1")
    .action(async () => {
      const instance = render(React.createElement(FlowScreen), {
        stdout: process.stdout,
        stdin: process.stdin,
        stderr: process.stderr,
        exitOnCtrlC: true,
      });
      await instance.waitUntilExit();
    });

  registerAudioCli(program);
  registerImageCli(program);
  registerVideoCli(program);

  program
    .command("serve")
    .description("Start HTTP API server (Express)")
    .option("--port <port>", "port to listen on", "3000")
    .action((opts: { port: string }) => {
      const app = createApp();
      const port = Number.parseInt(opts.port, 10);
      if (Number.isNaN(port) || port <= 0) {
        console.error("Invalid --port");
        process.exitCode = 1;
        return;
      }
      app.listen(port, "127.0.0.1", () => {
        console.error(`ffkity API listening on http://127.0.0.1:${port}`);
      });
    });

  program
    .command("mcp")
    .description("Start MCP server over stdio")
    .action(async () => {
      await startMcpServer();
    });

  return program;
}
