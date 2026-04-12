import { Box, Text } from "ink";
import React from "react";

import { layout, palette, symbols } from "./tokens.ts";

interface StackProps {
  children: React.ReactNode;
  rowGap?: number;
}

export function Stack({ children, rowGap = 0 }: StackProps) {
  return (
    <Box flexDirection="column" rowGap={rowGap}>
      {children}
    </Box>
  );
}

interface HeaderProps {
  title: string;
  version: string;
  meta?: string;
}

export function Header({ title, version, meta }: HeaderProps) {
  return (
    <Box flexDirection="column">
      <Box flexDirection="row" columnGap={1}>
        <Text bold color={palette.text}>
          {title}
        </Text>
        <Text dimColor>{version}</Text>
      </Box>
      {meta ? <Text dimColor>{meta}</Text> : null}
    </Box>
  );
}

interface CommandStripProps {
  line: string;
  width: number;
}

export function CommandStrip({ line, width }: CommandStripProps) {
  return (
    <Box width={width} backgroundColor={palette.stripBg} paddingX={1}>
      <Text bold color={palette.stripFg}>
        {line}
      </Text>
    </Box>
  );
}

interface ExecLineProps {
  label: string;
  tail: string;
}

export function ExecLine({ label, tail }: ExecLineProps) {
  return (
    <Box flexDirection="row">
      <Text color={palette.success}>{symbols.dot}</Text>
      <Text> </Text>
      <Text bold color={palette.text}>
        {label}
      </Text>
      <Text dimColor> {tail}</Text>
    </Box>
  );
}

interface InfoHeadingProps {
  title: string;
}

export function InfoHeading({ title }: InfoHeadingProps) {
  return (
    <Box marginTop={1} flexDirection="row" columnGap={1}>
      <Text dimColor>{symbols.info}</Text>
      <Text bold color={palette.text}>
        {title}
      </Text>
    </Box>
  );
}

interface ChevronStepProps {
  command: string;
  description?: string;
}

export function ChevronStep({ command, description }: ChevronStepProps) {
  return (
    <Box flexDirection="column" marginLeft={layout.chevronIndent}>
      <Text>
        <Text dimColor> </Text>
        <Text dimColor> </Text>
        <Text bold color={palette.text}>
          {symbols.chevron}{" "}
        </Text>
        <Text bold color={palette.text}>
          {command}
        </Text>
      </Text>
      {description ? (
        <Box marginLeft={layout.bodyIndent}>
          <Text dimColor>{description}</Text>
        </Box>
      ) : null}
    </Box>
  );
}

interface SummaryLineProps {
  children: React.ReactNode;
}

export function SummaryLine({ children }: SummaryLineProps) {
  return (
    <Box marginTop={1} flexDirection="row" flexWrap="wrap" columnGap={1}>
      <Text color={palette.text}>{symbols.dot}</Text>
      {children}
    </Box>
  );
}

interface MutedLineProps {
  children: React.ReactNode;
}

export function MutedLine({ children }: MutedLineProps) {
  return <Text dimColor>{children}</Text>;
}

interface FutureHintProps {
  children: React.ReactNode;
}

export function FutureHint({ children }: FutureHintProps) {
  return (
    <Box marginTop={1} flexDirection="row" columnGap={1}>
      <Text dimColor>{symbols.spinner}</Text>
      <Text dimColor>{children}</Text>
    </Box>
  );
}
