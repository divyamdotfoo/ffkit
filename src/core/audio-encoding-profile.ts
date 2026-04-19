/** API / validator enum values (unchanged). */
export const AUDIO_ENCODING_MODE_VALUES = ["compatible", "efficient"] as const;

/** Shown in CLI selects; `value` stays API-safe. */
export const AUDIO_ENCODING_MODE_FLOW_OPTIONS = [
  {
    value: "compatible",
    label: "compatible (widest player support)",
    description: "Bitrate only—simple encode, safest default.",
  },
  {
    value: "efficient",
    label: "efficient (smaller file, slower encode)",
    description: "Adds extra compression settings; same bitrate target, often smaller output.",
  },
] as const;

/** Command / MCP metadata for `encodingMode` parameter. */
export const AUDIO_ENCODING_MODE_PARAMETER_DESCRIPTION =
  "compatible (bitrate only—broad playback); efficient (extra compression—often smaller file, slower encode).";

export function getEncodingArgsForProfile(qualityProfile: string, encodingMode: string): string[] {
  const profileToBitrate: Record<string, string> = {
    "smaller-file": "96k",
    balanced: "160k",
    "higher-quality": "256k",
  };

  const bitrate = profileToBitrate[qualityProfile] ?? "160k";
  if (encodingMode === "efficient") {
    return ["-b:a", bitrate, "-compression_level", "8"];
  }
  return ["-b:a", bitrate];
}
