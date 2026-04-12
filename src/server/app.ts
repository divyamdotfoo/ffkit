import express from "express";

import { createHealthRouter } from "./routes/health.ts";
import { createOperationsRouter } from "./routes/operations.ts";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(createHealthRouter());
  app.use(createOperationsRouter());

  return app;
}
