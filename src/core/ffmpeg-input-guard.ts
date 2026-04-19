/**
 * Reject FFmpeg virtual / stream inputs that are not bounded by a normal media file.
 * Prevents mistakes or abuse like `-f lavfi -i anullsrc` style paths from reaching spawn.
 */
export function assertSafeFfmpegInputPath(resolvedPath: string): void {
  const trimmed = resolvedPath.trim();
  if (trimmed === "" || trimmed === "-") {
    throw new Error('Input path cannot be empty or "-" (stdin).');
  }
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("lavfi:")) {
    throw new Error("lavfi virtual inputs are not supported (unbounded streams).");
  }
  if (
    lower.startsWith("pipe:") ||
    lower.startsWith("tcp:") ||
    lower.startsWith("udp:") ||
    lower.startsWith("rtmp:") ||
    lower.startsWith("rtmps:") ||
    lower.startsWith("rtp:") ||
    lower.startsWith("srt:") ||
    lower.startsWith("gopher:")
  ) {
    throw new Error("Network or pipe FFmpeg inputs are not supported.");
  }
}

/** Reject stdout-style output that can surprise callers or grow without a real file path. */
export function assertSafeFfmpegOutputPath(outputPath: string): void {
  const trimmed = outputPath.trim();
  if (trimmed === "" || trimmed === "-") {
    throw new Error('Output path cannot be empty or "-" (stdout).');
  }
}
