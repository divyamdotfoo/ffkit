import { type Command } from "commander";
import { render } from "ink";
import React from "react";

import { FlowScreen } from "../../flow/screen.tsx";

export function registerImageCli(program: Command) {
  program
    .command("image")
    .description("Image operations")
    .action(async () => {
      const instance = render(React.createElement(FlowScreen, { startScope: "image" }), {
        stdout: process.stdout,
        stdin: process.stdin,
        stderr: process.stderr,
        exitOnCtrlC: true,
      });
      await instance.waitUntilExit();
    });
}
