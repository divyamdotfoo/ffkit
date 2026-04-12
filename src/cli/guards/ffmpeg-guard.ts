import { type Command } from "commander";
import { render } from "ink";
import React from "react";

import { checkFfmpegOnPath } from "../../core/ffmpeg-check.ts";
import {
  FfmpegMissingBody,
  FfmpegMissingScreen,
} from "../components/ffmpeg-missing.tsx";
import { printStaticInk } from "../render-ui.ts";

export function isFfmpegGuardBypassed(argv: string[]): boolean {
  const bypass = new Set(["--help", "-h", "--version", "-V"]);
  return argv.some((arg) => bypass.has(arg));
}

function printFfmpegMissingPlain(detail?: string): void {
  const lines = [
    "",
    "[ffkity] FFmpeg not found on PATH (expected command: ffmpeg).",
    "",
    "Install:",
    "  macOS (Homebrew):  brew install ffmpeg",
    "  Windows (winget):  winget install ffmpeg",
    "  Debian/Ubuntu:     sudo apt install ffmpeg",
    "  Fedora:            sudo dnf install ffmpeg",
    "",
    "Resources:",
    "  https://ffmpeg.org/download.html",
    "  https://trac.ffmpeg.org/wiki",
    "  https://ffmpeg.org/community.html",
    "",
    "If ffmpeg is installed, add its directory to PATH and retry.",
  ];

  if (detail) {
    lines.push("", `Details: ${detail}`);
  }

  console.error(lines.join("\n"));
}

function resolvePresentation(actionCommand: Command): "mcp" | "serve" | "cli" {
  const name = actionCommand.name();
  if (name === "mcp") {
    return "mcp";
  }
  if (name === "serve") {
    return "serve";
  }
  return "cli";
}

export async function runFfmpegGuard(
  _hookOwner: Command,
  actionCommand: Command
): Promise<void> {
  if (isFfmpegGuardBypassed(process.argv)) {
    return;
  }

  const result = checkFfmpegOnPath();
  if (result.ok) {
    return;
  }

  const mode = resolvePresentation(actionCommand);

  if (mode === "mcp") {
    printFfmpegMissingPlain(result.detail);
    process.exit(1);
  }

  const stream = mode === "serve" ? process.stderr : process.stdout;
  const interactive = Boolean(process.stdin.isTTY) && Boolean(stream.isTTY);

  if (!interactive) {
    printStaticInk(
      React.createElement(FfmpegMissingBody, {
        detail: result.detail,
        showControlsHint: false,
      }),
      stream
    );
    process.exit(1);
  }

  const instance = render(
    React.createElement(FfmpegMissingScreen, { detail: result.detail }),
    {
      stdout: stream,
      stdin: process.stdin,
      stderr: process.stderr,
      exitOnCtrlC: true,
    }
  );

  await instance.waitUntilExit();
  process.exit(1);
}
