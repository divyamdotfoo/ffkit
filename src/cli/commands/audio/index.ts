import { type Command } from "commander";
import { render } from "ink";
import React from "react";

import { FlowScreen } from "../../flow/screen.tsx";

export function registerAudioCli(program: Command) {
  program
    .command("audio")
    .description("Audio operations (interactive)")
    .action(async () => {
      const instance = render(React.createElement(FlowScreen, { startAtAudio: true }), {
        stdout: process.stdout,
        stdin: process.stdin,
        stderr: process.stderr,
        exitOnCtrlC: true,
      });
      await instance.waitUntilExit();
    });
}
