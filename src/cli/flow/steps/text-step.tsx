import { Box, Text } from "ink";
import React from "react";

import { InfoHeading, MutedLine, Stack } from "../../theme/primitives.tsx";
import { layout, palette } from "../../theme/tokens.ts";

interface TextStepViewProps {
  title: string;
  helpText?: string;
  value: string;
}

export function TextStepView({ title, helpText, value }: TextStepViewProps) {
  return (
    <Stack rowGap={0}>
      <InfoHeading title={title} />
      <Box marginLeft={layout.chevronIndent} flexDirection="column">
        <Text color={palette.text}>{">"} {value}</Text>
        {helpText ? <MutedLine>{helpText}</MutedLine> : null}
      </Box>
    </Stack>
  );
}
