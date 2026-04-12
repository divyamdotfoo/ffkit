#!/usr/bin/env node

import { bootstrapCli } from "./bootstrap-cli.ts";

bootstrapCli(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
