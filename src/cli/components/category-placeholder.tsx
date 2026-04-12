import { Box, Text } from "ink";
import React from "react";

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
import { listCommandsByCategory } from "../../core/command-registry.ts";
import type { Category } from "../../types.ts";

interface CategoryPlaceholderProps {
  category: Category;
}

export function CategoryPlaceholder({ category }: CategoryPlaceholderProps) {
  const columns = getTerminalColumns();
  const stripSource = `${symbols.chevron} ffkity ${category}`;
  const stripLine = truncateAscii(stripSource, Math.max(8, columns - 2));
  const commands = listCommandsByCategory(category);

  return (
    <Stack rowGap={1}>
      <Header title="ffkity" version="v0.0.1" meta={`${category} · skeleton`} />

      <CommandStrip line={stripLine} width={columns} />

      <ExecLine label="ffkity" tail={`${category} · placeholder surface`} />

      <InfoHeading title="Status" />
      <Box marginLeft={layout.chevronIndent}>
        <MutedLine>
          Registry lists {commands.length} descriptor(s) for this category (stubs).
        </MutedLine>
      </Box>

      <InfoHeading title="Next steps" />
      <ChevronStep
        command={`ffkity ${category} --help`}
        description="When you add flags, document them here"
      />

      <SummaryLine>
        <MutedLine>Back to overview:</MutedLine>
        <Text color={palette.accentBlue}>ffkity</Text>
      </SummaryLine>
    </Stack>
  );
}
