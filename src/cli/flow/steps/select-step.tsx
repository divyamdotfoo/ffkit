import { Box, Text } from "ink";
import React from "react";

import { InfoHeading, MutedLine, Stack } from "../../theme/primitives.tsx";
import { layout, palette, symbols } from "../../theme/tokens.ts";
import type { SelectOption, SelectStep } from "../types.ts";

interface SelectStepViewProps {
  step: SelectStep;
  selectedIndex: number;
  displayOptions?: SelectOption[];
  displayTitle?: string;
  displayHelpText?: string | undefined;
}

export function SelectStepView({
  step,
  selectedIndex,
  displayOptions,
  displayTitle,
  displayHelpText,
}: SelectStepViewProps) {
  const options = displayOptions ?? step.options;
  const title = displayTitle ?? step.title;
  const helpText = displayHelpText !== undefined ? displayHelpText : step.helpText;
  return (
    <Stack rowGap={0}>
      <InfoHeading title={title} />
      {helpText ? (
        <Box marginLeft={layout.chevronIndent}>
          <MutedLine>{helpText}</MutedLine>
        </Box>
      ) : null}
      {options.map((option, index) => {
        const selected = selectedIndex === index;
        const isLast = index === options.length - 1;
        return (
          <Box
            key={`${step.id}-${option.value}-${index}`}
            marginLeft={layout.chevronIndent}
            marginBottom={isLast ? 0 : 1}
            flexDirection="column"
          >
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
