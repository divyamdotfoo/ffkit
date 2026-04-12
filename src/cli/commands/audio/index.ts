import { type Command } from "commander";
import React from "react";

import { CategoryPlaceholder } from "../../components/category-placeholder.tsx";
import { printStaticInk } from "../../render-ui.ts";

export function registerAudioCli(program: Command) {
  program
    .command("audio")
    .description("Audio operations (skeleton)")
    .action(async () => {
      printStaticInk(React.createElement(CategoryPlaceholder, { category: "audio" }));
    });
}
