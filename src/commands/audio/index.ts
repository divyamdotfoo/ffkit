import { parseHhMmSsTimestampToSeconds } from "../../core/parse-hh-mm-ss-timestamp.ts";
import type { CommandDescriptor } from "../../types.ts";

export const audioCommands: CommandDescriptor[] = [
  {
    id: "audio_convert",
    category: "audio",
    name: "Convert format",
    description: "Convert audio format with practical quality and encoding choices.",
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    outputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    parameters: [
      {
        key: "targetFormat",
        label: "Target format",
        type: "enum",
        required: true,
        description: "Output file extension/format.",
        options: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
      },
      {
        key: "qualityProfile",
        label: "Quality profile",
        type: "enum",
        required: true,
        description: "Balanced defaults for most users.",
        options: ["smaller-file", "balanced", "higher-quality"],
      },
      {
        key: "encodingMode",
        label: "Encoding mode",
        type: "enum",
        required: true,
        description: "Simple encoding strategy for common workflows.",
        options: ["compatible", "efficient"],
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const qualityProfile = String(params.qualityProfile ?? "balanced");
      const encodingMode = String(params.encodingMode ?? "compatible");
      return [
        "-i",
        inputPath,
        ...getEncodingArgsForProfile(qualityProfile, encodingMode),
        outputPath,
      ];
    },
  },
  {
    id: "audio_trim",
    category: "audio",
    name: "Trim segment",
    description:
      "Trim audio from a start timestamp to an end timestamp (HH:MM:SS) using stream copy.",
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    outputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    parameters: [
      {
        key: "startTimestamp",
        label: "Start timestamp",
        type: "string",
        required: true,
        description: "Inclusive start time as HH:MM:SS (hours may exceed 23; seconds may include decimals).",
      },
      {
        key: "endTimestamp",
        label: "End timestamp",
        type: "string",
        required: true,
        description: "End time as HH:MM:SS; must be after start (clip length is end minus start).",
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const startSeconds = parseHhMmSsTimestampToSeconds(params.startTimestamp, "startTimestamp");
      const endSeconds = parseHhMmSsTimestampToSeconds(params.endTimestamp, "endTimestamp");
      if (endSeconds <= startSeconds) {
        throw new Error("endTimestamp must be after startTimestamp.");
      }
      const durationSeconds = endSeconds - startSeconds;
      return [
        "-ss",
        `${startSeconds}`,
        "-i",
        inputPath,
        "-t",
        `${durationSeconds}`,
        "-c",
        "copy",
        outputPath,
      ];
    },
  },
  {
    id: "audio_normalize",
    category: "audio",
    name: "Normalize loudness",
    description: "Normalize speech/music loudness for consistent playback volume.",
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    outputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    parameters: [
      {
        key: "strength",
        label: "Normalization strength",
        type: "enum",
        required: true,
        description: "How aggressively to normalize loudness.",
        options: ["light", "standard", "strong"],
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const strength = String(params.strength ?? "standard");
      return ["-i", inputPath, "-af", getLoudNormFilter(strength), outputPath];
    },
  },
];

function getEncodingArgsForProfile(qualityProfile: string, encodingMode: string): string[] {
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

function getLoudNormFilter(strength: string): string {
  if (strength === "light") {
    return "loudnorm=I=-18:LRA=11:TP=-2";
  }
  if (strength === "strong") {
    return "loudnorm=I=-14:LRA=7:TP=-1.5";
  }
  return "loudnorm=I=-16:LRA=9:TP=-2";
}
