import { extname } from "node:path";

import { parseHhMmSsTimestampToSeconds } from "../../core/parse-hh-mm-ss-timestamp.ts";
import type { CommandDescriptor } from "../../types.ts";

export const videoCommands: CommandDescriptor[] = [
  {
    id: "video_convert",
    category: "video",
    name: "Convert format",
    description: "Convert video format with broadly compatible defaults.",
    inputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    outputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    parameters: [
      {
        key: "targetFormat",
        label: "Target format",
        type: "enum",
        required: true,
        description: "Output file extension/format.",
        options: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath }) => {
      const outputExt = getOutputExt(outputPath);
      const codecs = getCodecsForContainer(outputExt);
      return [
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-c:v",
        codecs.videoCodec,
        ...codecs.videoCodecArgs,
        ...(codecs.audioCodec ? ["-c:a", codecs.audioCodec, ...codecs.audioCodecArgs] : []),
        outputPath,
      ];
    },
  },
  {
    id: "video_trim",
    category: "video",
    name: "Trim segment",
    description:
      "Trim video from a start timestamp to an end timestamp (HH:MM:SS) using stream copy (fast; cuts may align to keyframes).",
    inputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    outputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
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
    id: "video_merge",
    category: "video",
    name: "Merge clips",
    description:
      "Concatenate multiple videos in order using FFmpeg's concat demuxer and re-encode to the target container. Works best when clips share similar resolution and audio layout; mixed or missing audio tracks may fail.",
    inputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    outputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    parameters: [
      {
        key: "inputPaths",
        label: "Input video paths",
        type: "paths",
        required: true,
        minItems: 2,
        description: "Ordered list of server-local video files to concatenate.",
      },
      {
        key: "targetFormat",
        label: "Target format",
        type: "enum",
        required: true,
        description: "Output file extension/format.",
        options: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
      },
    ],
    buildFfmpegArgs: ({ outputPath, concatListPath }) => {
      if (!concatListPath) {
        throw new Error("Missing concat list path for video_merge.");
      }
      const outputExt = getOutputExt(outputPath);
      const codecs = getCodecsForContainer(outputExt);
      return [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-vf",
        "setsar=1",
        "-c:v",
        codecs.videoCodec,
        ...codecs.videoCodecArgs,
        ...(codecs.audioCodec ? ["-c:a", codecs.audioCodec, ...codecs.audioCodecArgs] : []),
        outputPath,
      ];
    },
  },
  {
    id: "video_speed",
    category: "video",
    name: "Change playback speed",
    description: "Speed up or slow down video and audio by a multiplier.",
    inputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    outputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    parameters: [
      {
        key: "speedMultiplier",
        label: "Speed multiplier",
        type: "number",
        required: true,
        description: "Playback speed factor, e.g. 1.25",
        min: 0.25,
        max: 4,
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const speedMultiplier = getNumberParam(params.speedMultiplier, 1);
      const videoFilter = `setpts=${1 / speedMultiplier}*PTS`;
      const audioFilter = buildAtempoFilter(speedMultiplier);
      const outputExt = getOutputExt(outputPath);
      const codecs = getCodecsForContainer(outputExt);
      return [
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-filter:v",
        videoFilter,
        "-filter:a",
        audioFilter,
        "-c:v",
        codecs.videoCodec,
        ...codecs.videoCodecArgs,
        ...(codecs.audioCodec ? ["-c:a", codecs.audioCodec, ...codecs.audioCodecArgs] : []),
        outputPath,
      ];
    },
  },
  {
    id: "video_screenshot",
    category: "video",
    name: "Extract screenshot",
    description: "Extract a still image from the video at a chosen timestamp.",
    inputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    outputFormats: ["png", "jpg", "jpeg", "webp"],
    parameters: [
      {
        key: "timestampSeconds",
        label: "Timestamp (seconds)",
        type: "number",
        required: true,
        description: "When to capture the screenshot.",
        min: 0,
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const timestampSeconds = getNumberParam(params.timestampSeconds, 0);
      return [
        "-ss",
        `${timestampSeconds}`,
        "-i",
        inputPath,
        "-frames:v",
        "1",
        "-q:v",
        "2",
        outputPath,
      ];
    },
  },
  {
    id: "video_gif",
    category: "video",
    name: "Create GIF",
    description: "Create a GIF from the full video or from a selected segment.",
    inputFormats: ["mp4", "mov", "mkv", "avi", "webm", "m4v"],
    outputFormats: ["gif"],
    parameters: [
      {
        key: "rangeMode",
        label: "Range mode",
        type: "enum",
        required: true,
        description: "Convert full video or only a segment.",
        options: ["full", "segment"],
      },
      {
        key: "startSeconds",
        label: "Start time (seconds)",
        type: "number",
        required: false,
        description: "Optional segment start.",
        min: 0,
      },
      {
        key: "endSeconds",
        label: "End time (seconds)",
        type: "number",
        required: false,
        description: "Optional segment end.",
        min: 0,
      },
    ],
    buildFfmpegArgs: ({ inputPath, outputPath, params }) => {
      const rangeMode = String(params.rangeMode ?? "full");
      const startSeconds = getOptionalNumber(params.startSeconds);
      const endSeconds = getOptionalNumber(params.endSeconds);
      const args = ["-i", inputPath];
      if (rangeMode === "segment" && typeof startSeconds === "number") {
        args.unshift(`${startSeconds}`);
        args.unshift("-ss");
      }
      if (
        rangeMode === "segment" &&
        typeof startSeconds === "number" &&
        typeof endSeconds === "number" &&
        endSeconds > startSeconds
      ) {
        args.push("-t", `${endSeconds - startSeconds}`);
      }
      args.push("-vf", "fps=12,scale=640:-1:flags=lanczos", "-loop", "0", outputPath);
      return args;
    },
  },
];

function buildAtempoFilter(speedMultiplier: number): string {
  if (speedMultiplier <= 0) {
    return "atempo=1.0";
  }
  const chain: string[] = [];
  let remaining = speedMultiplier;
  while (remaining > 2) {
    chain.push("atempo=2.0");
    remaining /= 2;
  }
  while (remaining < 0.5) {
    chain.push("atempo=0.5");
    remaining /= 0.5;
  }
  chain.push(`atempo=${remaining}`);
  return chain.join(",");
}

function getNumberParam(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  const converted = Number(value);
  if (Number.isNaN(converted)) {
    return fallback;
  }
  return converted;
}

function getOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const converted = Number(value);
  if (Number.isNaN(converted)) {
    return undefined;
  }
  return converted;
}

function getOutputExt(outputPath: string): string {
  return extname(outputPath).replace(".", "").toLowerCase();
}

function getCodecsForContainer(outputExt: string): {
  videoCodec: string;
  videoCodecArgs: string[];
  audioCodec: string | null;
  audioCodecArgs: string[];
} {
  if (outputExt === "webm") {
    return {
      videoCodec: "libvpx-vp9",
      videoCodecArgs: ["-b:v", "0", "-crf", "33"],
      audioCodec: "libopus",
      audioCodecArgs: ["-b:a", "128k"],
    };
  }
  if (outputExt === "mp4" || outputExt === "mov" || outputExt === "m4v") {
    return {
      videoCodec: "libx264",
      videoCodecArgs: ["-preset", "medium", "-crf", "23"],
      audioCodec: "aac",
      audioCodecArgs: ["-b:a", "160k"],
    };
  }
  if (outputExt === "mkv") {
    return {
      videoCodec: "libx264",
      videoCodecArgs: ["-preset", "medium", "-crf", "23"],
      audioCodec: "aac",
      audioCodecArgs: ["-b:a", "160k"],
    };
  }
  if (outputExt === "avi") {
    return {
      videoCodec: "libx264",
      videoCodecArgs: ["-preset", "medium", "-crf", "23"],
      audioCodec: "aac",
      audioCodecArgs: ["-b:a", "160k"],
    };
  }
  return {
    videoCodec: "libx264",
    videoCodecArgs: ["-preset", "medium", "-crf", "23"],
    audioCodec: "aac",
    audioCodecArgs: ["-b:a", "160k"],
  };
}
