import {
  AUDIO_ENCODING_MODE_PARAMETER_DESCRIPTION,
  AUDIO_ENCODING_MODE_VALUES,
  getEncodingArgsForProfile,
} from "../../core/audio-encoding-profile.ts";
import {
  SILENCE_REMOVAL_PRESET_PARAMETER_DESCRIPTION,
  SILENCE_REMOVAL_PRESET_VALUES,
  buildSilenceRemoveAudioFilter,
} from "../../core/audio-silence-presets.ts";
import { parseHhMmSsTimestampToSeconds } from "../../core/parse-hh-mm-ss-timestamp.ts";
import type { CommandDescriptor } from "../../types.ts";

export const audioCommands: CommandDescriptor[] = [
  {
    id: "audio_convert",
    category: "audio",
    name: "Convert format",
    description: "Convert audio format with practical quality and encoding choices.",
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac", "webm"],
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
        description: AUDIO_ENCODING_MODE_PARAMETER_DESCRIPTION,
        options: [...AUDIO_ENCODING_MODE_VALUES],
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
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac", "webm"],
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
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac", "webm"],
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
  {
    id: "audio_remove_silence",
    category: "audio",
    name: "Remove silence",
    description:
      "Strip leading, internal, and trailing silence using FFmpeg silenceremove (RMS detection), then re-encode to your chosen output format. Presets map to dB thresholds and minimum gap length; aggressive presets may affect short pauses or soft sounds.",
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac", "webm"],
    outputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    parameters: [
      {
        key: "silencePreset",
        label: "Silence removal preset",
        type: "enum",
        required: true,
        description: SILENCE_REMOVAL_PRESET_PARAMETER_DESCRIPTION,
        options: [...SILENCE_REMOVAL_PRESET_VALUES],
      },
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
        description: AUDIO_ENCODING_MODE_PARAMETER_DESCRIPTION,
        options: [...AUDIO_ENCODING_MODE_VALUES],
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const silencePreset = String(params.silencePreset ?? "level_2");
      const qualityProfile = String(params.qualityProfile ?? "balanced");
      const encodingMode = String(params.encodingMode ?? "compatible");
      return [
        "-i",
        inputPath,
        "-af",
        buildSilenceRemoveAudioFilter(silencePreset),
        ...getEncodingArgsForProfile(qualityProfile, encodingMode),
        outputPath,
      ];
    },
  },
  {
    id: "audio_merge",
    category: "audio",
    name: "Merge clips",
    description:
      "Concatenate multiple audio files in order using FFmpeg's concat demuxer and re-encode to the target format. Works best when clips share similar sample rate and channel layout; mixed layouts may fail.",
    inputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac", "webm"],
    outputFormats: ["mp3", "wav", "aac", "m4a", "ogg", "flac"],
    parameters: [
      {
        key: "inputPaths",
        label: "Input audio paths",
        type: "paths",
        required: true,
        minItems: 2,
        description: "Ordered list of server-local audio files to concatenate.",
      },
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
        description: AUDIO_ENCODING_MODE_PARAMETER_DESCRIPTION,
        options: [...AUDIO_ENCODING_MODE_VALUES],
      },
    ],
    buildFfmpegArgs: ({ outputPath, concatListPath, params }) => {
      if (!concatListPath) {
        throw new Error("Missing concat list path for audio_merge.");
      }
      const qualityProfile = String(params.qualityProfile ?? "balanced");
      const encodingMode = String(params.encodingMode ?? "compatible");
      return [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-vn",
        "-map",
        "0:a",
        ...getEncodingArgsForProfile(qualityProfile, encodingMode),
        outputPath,
      ];
    },
  },
];

function getLoudNormFilter(strength: string): string {
  if (strength === "light") {
    return "loudnorm=I=-18:LRA=11:TP=-2";
  }
  if (strength === "strong") {
    return "loudnorm=I=-14:LRA=7:TP=-1.5";
  }
  return "loudnorm=I=-16:LRA=9:TP=-2";
}
