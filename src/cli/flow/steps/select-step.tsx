import { Box, Text } from "ink";
import React from "react";

import { InfoHeading, MutedLine, Stack } from "../../theme/primitives.tsx";
import { layout, palette, symbols } from "../../theme/tokens.ts";
import type { SelectStep } from "../types.ts";

interface SelectStepViewProps {
  step: SelectStep;
  selectedIndex: number;
}

export function SelectStepView({ step, selectedIndex }: SelectStepViewProps) {
  return (
    <Stack rowGap={0}>
      <InfoHeading title={step.title} />
      {step.helpText ? (
        <Box marginLeft={layout.chevronIndent}>
          <MutedLine>{step.helpText}</MutedLine>
        </Box>
      ) : null}
      {step.options.map((option, index) => {
        const selected = selectedIndex === index;
        return (
          <Box key={`${step.id}-${option.value}`} marginLeft={layout.chevronIndent} flexDirection="column">
            <Text color={selected ? palette.accentBlue : palette.text}>
              {selected ? symbols.chevron : " "}
              {" "}
              {option.label}
            </Text>
            {option.description ? (
              <Box marginLeft={layout.bodyIndent}>
                <MutedLine>{option.description}</MutedLine>
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Stack>
  );
}
