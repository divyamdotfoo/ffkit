import { type Command } from "commander";
import { render } from "ink";
import React from "react";

import { CategoryPlaceholder } from "../../components/category-placeholder.tsx";

export function registerVideoCli(program: Command) {
  program
    .command("video")
    .description("Video operations (skeleton)")
    .action(() => {
      render(React.createElement(CategoryPlaceholder, { category: "video" }));
    });
}
