import { Router } from "express";

import { getCommand, listCommands, listCommandsByCategory } from "../../core/command-registry.ts";
import { toPublicCommand } from "../../core/public-command.ts";
import type { Category } from "../../types.ts";

const categories: Category[] = ["image", "audio", "video"];

function isCategory(value: string): value is Category {
  return (categories as string[]).includes(value);
}

export function createCommandsRouter(): Router {
  const router = Router();

  router.get("/v1/commands", (req, res) => {
    const raw = req.query.category;
    const categoryParam = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
    if (typeof categoryParam === "string" && categoryParam.length > 0 && !isCategory(categoryParam)) {
      res.status(400).json({ error: "Invalid category", allowed: categories });
      return;
    }
    const category = typeof categoryParam === "string" && isCategory(categoryParam) ? categoryParam : undefined;

    const commands = category ? listCommandsByCategory(category) : listCommands();
    res.status(200).json({ commands: commands.map(toPublicCommand) });
  });

  router.get("/v1/commands/:id", (req, res) => {
    const command = getCommand(req.params.id);
    if (!command) {
      res.status(404).json({ error: "Command not found", id: req.params.id });
      return;
    }
    res.status(200).json({ command: toPublicCommand(command) });
  });

  return router;
}
