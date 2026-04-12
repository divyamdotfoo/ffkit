import { type Command } from "commander";
import { render } from "ink";
import React from "react";

import { CategoryPlaceholder } from "../../components/category-placeholder.tsx";

export function registerImageCli(program: Command) {
  program
    .command("image")
    .description("Image operations (skeleton)")
    .action(() => {
      render(React.createElement(CategoryPlaceholder, { category: "image" }));
    });
}
