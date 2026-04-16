import { type Command } from "commander";
import { render } from "ink";
import React from "react";

import { FlowScreen } from "../../flow/screen.tsx";

export function registerVideoCli(program: Command) {
  program
    .command("video")
    .description("Video operations")
    .action(async () => {
      const instance = render(React.createElement(FlowScreen, { startScope: "video" }), {
        stdout: process.stdout,
        stdin: process.stdin,
        stderr: process.stderr,
        exitOnCtrlC: true,
      });
      await instance.waitUntilExit();
    });
}
