import { renderToString } from "ink";
import type { ReactElement } from "react";

export function getTerminalColumns(): number {
  const stdoutCols = process.stdout.columns;
  const stderrCols = process.stderr.columns;
  const best = Math.max(
    typeof stdoutCols === "number" ? stdoutCols : 0,
    typeof stderrCols === "number" ? stderrCols : 0,
  );
  return best >= 40 ? best : 80;
}

export function printStaticInk(
  node: ReactElement,
  stream: NodeJS.WriteStream = process.stdout,
): void {
  const columns = getTerminalColumns();
  const text = renderToString(node, { columns });
  stream.write(text);
  if (!text.endsWith("\n")) {
    stream.write("\n");
  }
}

export function truncateAscii(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  if (maxLength <= 3) {
    return text.slice(0, maxLength);
  }
  return `${text.slice(0, maxLength - 3)}...`;
}
