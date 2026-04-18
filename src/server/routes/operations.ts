import { Router } from "express";

import { getCommand } from "../../core/command-registry.ts";
import { executeCommand } from "../../core/executor.ts";

export function createOperationsRouter(): Router {
  const router = Router();

  router.post("/v1/operations/:id", async (req, res) => {
    const command = getCommand(req.params.id);
    if (!command) {
      res.status(404).json({ error: "Command not found", id: req.params.id });
      return;
    }

    const body = req.body;
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({ error: "Request body must be a JSON object." });
      return;
    }

    const params = body as Record<string, unknown>;

    try {
      const result = await executeCommand(command, params);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  });

  return router;
}
