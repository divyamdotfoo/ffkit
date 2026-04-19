export function parseHhMmSsTimestampToSeconds(value: unknown, paramKey: string): number {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Parameter "${paramKey}" must be a non-empty timestamp in HH:MM:SS format.`);
  }
  const trimmed = value.trim();
  const segments = trimmed.split(":");
  if (segments.length !== 3) {
    throw new Error(
      `Parameter "${paramKey}" must have three colon-separated parts (HH:MM:SS), e.g. 00:01:30 or 1:02:03.5 (got "${trimmed}").`,
    );
  }
  const [hRaw, mRaw, sRaw] = segments;
  if (hRaw === undefined || mRaw === undefined || sRaw === undefined || hRaw === "" || mRaw === "" || sRaw === "") {
    throw new Error(`Parameter "${paramKey}" is missing hour, minute, or second in HH:MM:SS.`);
  }
  const hours = Number(hRaw);
  const minutes = Number(mRaw);
  const seconds = Number(sRaw);
  if ([hours, minutes, seconds].some((n) => Number.isNaN(n) || n < 0)) {
    throw new Error(`Parameter "${paramKey}" must use non-negative numbers in HH:MM:SS.`);
  }
  if (minutes >= 60 || seconds >= 60) {
    throw new Error(
      `Parameter "${paramKey}" is invalid: minutes and seconds must each be less than 60.`,
    );
  }
  return hours * 3600 + minutes * 60 + seconds;
}
