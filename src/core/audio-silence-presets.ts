/** API / validator values (maps to FFmpeg `silenceremove` thresholds and timings). */
export const SILENCE_REMOVAL_PRESET_VALUES = ["level_1", "level_2", "level_3"] as const;

export const SILENCE_REMOVAL_PRESET_PARAMETER_DESCRIPTION =
  "level_1: gentle (quiet gaps only, ~−58 dB, ≥~0.45 s); level_2: balanced (~−50 dB, ≥~0.25 s); level_3: aggressive (~−42 dB, ≥~0.12 s)—may tighten pauses between words.";

/** Ink select rows: `value` is sent as `silencePreset` to ffmpeg command. */
export const SILENCE_REMOVAL_FLOW_OPTIONS = [
  {
    value: "level_1",
    label: "Level 1 — gentle (safest)",
    description: "Only removes longer dead air; highest quiet threshold (−58 dB), min gap ~0.45 s.",
  },
  {
    value: "level_2",
    label: "Level 2 — balanced (default)",
    description: "Typical voice cleanup (−50 dB), min gap ~0.25 s.",
  },
  {
    value: "level_3",
    label: "Level 3 — aggressive",
    description: "Trims shorter pauses (−42 dB, ~0.12 s); may affect breaths or soft tails.",
  },
] as const;

interface SilenceFfmpegNumbers {
  startThresholdDb: string;
  stopDurationSec: string;
  startDurationSec: string;
}

const PRESET_LEVEL_1: SilenceFfmpegNumbers = {
  startThresholdDb: "-58dB",
  stopDurationSec: "0.45",
  startDurationSec: "0.22",
};

const PRESET_LEVEL_2: SilenceFfmpegNumbers = {
  startThresholdDb: "-50dB",
  stopDurationSec: "0.25",
  startDurationSec: "0.12",
};

const PRESET_LEVEL_3: SilenceFfmpegNumbers = {
  startThresholdDb: "-42dB",
  stopDurationSec: "0.12",
  startDurationSec: "0.06",
};

function getSilencePresetNumbers(silencePreset: string): SilenceFfmpegNumbers {
  if (silencePreset === "level_1") {
    return PRESET_LEVEL_1;
  }
  if (silencePreset === "level_3") {
    return PRESET_LEVEL_3;
  }
  return PRESET_LEVEL_2;
}

export function buildSilenceRemoveAudioFilter(silencePreset: string): string {
  const numbers = getSilencePresetNumbers(silencePreset);
  const threshold = numbers.startThresholdDb;
  return [
    "silenceremove=start_periods=1",
    `start_duration=${numbers.startDurationSec}`,
    `start_threshold=${threshold}`,
    "stop_periods=-1",
    `stop_duration=${numbers.stopDurationSec}`,
    `stop_threshold=${threshold}`,
    "detection=rms",
  ].join(":");
}
