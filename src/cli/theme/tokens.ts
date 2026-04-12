export const symbols = {
  chevron: ">",
  info: "i",
  dot: "●",
  spinner: "◐",
  ok: "✔",
  bad: "✖",
} as const;

export const palette = {
  /** Primary body */
  text: "white",
  /** Secondary / de-emphasized */
  meta: "gray",
  /** Highlights: commands, URLs you want to pop */
  accentBlue: "blue",
  /** Success / active status */
  success: "green",
  /** Errors */
  danger: "red",
  /** Warnings / details */
  warn: "yellow",
  /** Command strip background */
  stripBg: "gray",
  stripFg: "white",
} as const;

export const layout = {
  chevronIndent: 2,
  bodyIndent: 4,
} as const;
