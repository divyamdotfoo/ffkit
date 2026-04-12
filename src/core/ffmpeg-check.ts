import { spawnSync } from "node:child_process";

export interface FfmpegCheckResult {
  ok: boolean;
  versionLine?: string;
  detail?: string;
}

export function checkFfmpegOnPath(): FfmpegCheckResult {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-version"], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });

  if (result.error) {
    return {
      ok: false,
      detail: result.error.message,
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      detail:
        result.stderr.trim() ||
        result.stdout.trim() ||
        "ffmpeg exited with a non-zero status.",
    };
  }

  const versionLine = result.stdout.split("\n")[0]?.trim();

  return {
    ok: true,
    versionLine: versionLine || "ffmpeg is available on PATH.",
  };
}
