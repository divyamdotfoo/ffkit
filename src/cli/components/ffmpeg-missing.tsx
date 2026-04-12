import { Box, Text, useApp, useInput } from "ink";
import React, { useEffect } from "react";

import { getTerminalColumns, truncateAscii } from "../render-ui.ts";
import {
  ChevronStep,
  CommandStrip,
  ExecLine,
  Header,
  InfoHeading,
  MutedLine,
  Stack,
  SummaryLine,
} from "../theme/primitives.tsx";
import { layout, palette, symbols } from "../theme/tokens.ts";

const RESOURCES: { label: string; url: string }[] = [
  { label: "Official downloads", url: "https://ffmpeg.org/download.html" },
  { label: "Documentation / wiki", url: "https://trac.ffmpeg.org/wiki" },
  { label: "Community", url: "https://ffmpeg.org/community.html" },
];

interface FfmpegMissingBodyProps {
  detail?: string;
  showControlsHint?: boolean;
}

export function FfmpegMissingBody({
  detail,
  showControlsHint = true,
}: FfmpegMissingBodyProps) {
  const columns = getTerminalColumns();
  const stripLine = truncateAscii(
    `${symbols.chevron} ffkity (ffmpeg missing)`,
    Math.max(8, columns - 2),
  );

  return (
    <Stack rowGap={1}>
      <Header title="ffkity" version="v0.0.1" meta="ffmpeg not found" />

      <CommandStrip line={stripLine} width={columns} />

      <ExecLine label="ffmpeg" tail="not on PATH (expected: ffmpeg)" />

      <InfoHeading title="Install" />
      <ChevronStep command="brew install ffmpeg" description="macOS (Homebrew)" />
      <ChevronStep command="winget install ffmpeg" description="Windows (winget)" />
      <ChevronStep command="choco install ffmpeg" description="Windows (Chocolatey)" />
      <ChevronStep command="sudo apt install ffmpeg" description="Debian / Ubuntu" />
      <ChevronStep command="sudo dnf install ffmpeg" description="Fedora" />

      <InfoHeading title="Already installed?" />
      <Box marginLeft={layout.chevronIndent}>
        <MutedLine>
          Put the folder containing ffmpeg on PATH for this terminal session, then
          reopen the terminal (Windows) or reload shell config (macOS / Linux).
        </MutedLine>
      </Box>

      <InfoHeading title="Resources" />
      {RESOURCES.map((item) => (
        <Box key={item.url} marginLeft={layout.chevronIndent} flexDirection="column">
          <Text dimColor>
            {item.label}: <Text color={palette.accentBlue}>{item.url}</Text>
          </Text>
        </Box>
      ))}

      {detail ? (
        <Box marginTop={1} flexDirection="column" marginLeft={layout.chevronIndent}>
          <Text color={palette.warn}>Details</Text>
          <MutedLine>{detail}</MutedLine>
        </Box>
      ) : null}

      {showControlsHint ? (
        <MutedLine>Press Q or Esc to exit (interactive terminals).</MutedLine>
      ) : null}

      <SummaryLine>
        <MutedLine>Then retry:</MutedLine>
        <Text color={palette.accentBlue}>ffkity</Text>
      </SummaryLine>
    </Stack>
  );
}

interface FfmpegMissingScreenProps {
  detail?: string;
}

export function FfmpegMissingScreen({ detail }: FfmpegMissingScreenProps) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      exit();
    }
  });

  useEffect(() => {
    if (!process.stdin.isTTY) {
      const timer = setTimeout(() => exit(), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [exit]);

  return <FfmpegMissingBody detail={detail} showControlsHint />;
}
