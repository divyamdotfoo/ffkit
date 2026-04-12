import { Box, Text } from "ink";
import React from "react";

import { listCommandsByCategory } from "../../core/command-registry.ts";
import type { Category } from "../../types.ts";

interface CategoryPlaceholderProps {
  category: Category;
}

export function CategoryPlaceholder({ category }: CategoryPlaceholderProps) {
  const commands = listCommandsByCategory(category);

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>
        {category} — skeleton
      </Text>
      <Text dimColor>
        {commands.length} placeholder descriptor(s). Wire real Commander options
        here later.
      </Text>
    </Box>
  );
}
