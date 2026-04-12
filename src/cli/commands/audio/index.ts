import { type Command } from "commander";
import { render } from "ink";
import React from "react";

import { CategoryPlaceholder } from "../../components/category-placeholder.tsx";

export function registerAudioCli(program: Command) {
  program
    .command("audio")
    .description("Audio operations (skeleton)")
    .action(() => {
      render(React.createElement(CategoryPlaceholder, { category: "audio" }));
    });
}
