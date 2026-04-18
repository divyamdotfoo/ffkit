import express from "express";

import { createCommandsRouter } from "./routes/commands.ts";
import { createOperationsRouter } from "./routes/operations.ts";

export function createApp() {
  const app = express();
  app.use(createCommandsRouter());
  app.use(createOperationsRouter());

  return app;
}
