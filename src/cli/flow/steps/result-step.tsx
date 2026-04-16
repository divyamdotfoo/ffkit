import { Box, Text } from "ink";
import React from "react";

import { MutedLine, Stack } from "../../theme/primitives.tsx";
import { layout, palette, symbols } from "../../theme/tokens.ts";

interface ResultStepViewProps {
  success: boolean;
  lines: string[];
}

export function ResultStepView({ success, lines }: ResultStepViewProps) {
  return (
    <Stack rowGap={0}>
      <Box marginLeft={layout.chevronIndent}>
        <Text color={success ? palette.success : palette.danger}>
          {success ? symbols.ok : symbols.bad}
          {" "}
          {success ? "Done" : "Failed"}
        </Text>
      </Box>
      {lines.map((line) => (
        <Box key={line} marginLeft={layout.chevronIndent}>
          <MutedLine>{line}</MutedLine>
        </Box>
      ))}
    </Stack>
  );
}
