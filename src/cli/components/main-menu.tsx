import { Box, Text } from "ink";
import React from "react";

import { getTerminalColumns, truncateAscii } from "../render-ui.ts";
import {
  ChevronStep,
  CommandStrip,
  ExecLine,
  FutureHint,
  Header,
  InfoHeading,
  MutedLine,
  Stack,
  SummaryLine,
} from "../theme/primitives.tsx";
import { layout, palette, symbols } from "../theme/tokens.ts";
import { listCommands } from "../../core/command-registry.ts";
import { checkFfmpegOnPath } from "../../core/ffmpeg-check.ts";

export function MainMenu() {
  const columns = getTerminalColumns();
  const argv = process.argv;
  const rest = argv.slice(2).join(" ").trim();
  const stripSource = rest ? `${symbols.chevron} ffkity ${rest}` : `${symbols.chevron} ffkity`;
  const stripLine = truncateAscii(stripSource, Math.max(8, columns - 2));

  const ffmpeg = checkFfmpegOnPath();
  const count = listCommands().length;

  return (
    <Stack rowGap={1}>
      <Header title="ffkity" version="v0.0.1" meta="ffmpeg wrapper · CLI · HTTP · MCP" />

      <CommandStrip line={stripLine} width={columns} />

      <ExecLine label="ffkity" tail="home · overview" />

      <Stack rowGap={0}>
        <InfoHeading title="What you can run" />
        <ChevronStep command="ffkity" description="Open this overview (default)" />
        <ChevronStep command="ffkity image" description="Image flows (skeleton)" />
        <ChevronStep command="ffkity audio" description="Audio flows (skeleton)" />
        <ChevronStep command="ffkity video" description="Video flows (skeleton)" />
        <ChevronStep command="ffkity serve" description="Start HTTP API (Express)" />
        <ChevronStep command="ffkity mcp" description="Start MCP server (stdio)" />
      </Stack>

      <Stack rowGap={0}>
        <InfoHeading title="Environment" />
        {ffmpeg.ok ? (
          <Box flexDirection="column" marginLeft={layout.chevronIndent}>
            <Box flexDirection="row" columnGap={1}>
              <Text color={palette.success}>{symbols.ok}</Text>
              <Text bold color={palette.text}>
                ffmpeg
              </Text>
            </Box>
            <Box marginLeft={layout.bodyIndent}>
              <MutedLine>{ffmpeg.versionLine}</MutedLine>
            </Box>
          </Box>
        ) : (
          <Box flexDirection="column" marginLeft={layout.chevronIndent}>
            <Box flexDirection="row" columnGap={1}>
              <Text color={palette.danger}>{symbols.bad}</Text>
              <Text bold color={palette.text}>
                ffmpeg missing
              </Text>
            </Box>
            <Box marginLeft={layout.bodyIndent}>
              <MutedLine>Run ffkity again after installing; see error screen for hints.</MutedLine>
            </Box>
          </Box>
        )}
        <Box marginLeft={layout.chevronIndent}>
          <MutedLine>Registry: {count} placeholder descriptor(s).</MutedLine>
        </Box>
      </Stack>

      <Stack rowGap={0}>
        <InfoHeading title="Next steps" />
        <ChevronStep command="ffkity image" description="Start wiring your first real operation" />
        <ChevronStep command="ffkity serve --port 3000" description="Boot the HTTP shell locally" />
      </Stack>

      <FutureHint>More commands will appear here as you add definitions.</FutureHint>

      <SummaryLine>
        <MutedLine>Docs in-terminal:</MutedLine>
        <Text color={palette.accentBlue}>ffkity --help</Text>
      </SummaryLine>
    </Stack>
  );
}
