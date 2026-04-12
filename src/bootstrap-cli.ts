import { createCliProgram } from "./cli/index.ts";

export async function bootstrapCli(argv: string[]): Promise<void> {
  const program = createCliProgram();
  await program.parseAsync(argv);
}
