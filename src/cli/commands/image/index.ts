import { type Command } from "commander";
import React from "react";

import { CategoryPlaceholder } from "../../components/category-placeholder.tsx";
import { printStaticInk } from "../../render-ui.ts";

export function registerImageCli(program: Command) {
  program
    .command("image")
    .description("Image operations (skeleton)")
    .action(async () => {
      printStaticInk(React.createElement(CategoryPlaceholder, { category: "image" }));
    });
}
