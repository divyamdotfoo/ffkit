import { Box, Text } from "ink";
import React from "react";

import { listCommands } from "../../core/command-registry.ts";

export function WelcomeApp() {
  const count = listCommands().length;

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="cyan">
        ffkity
      </Text>
      <Text>Placeholder CLI — add real flows one command at a time.</Text>
      <Text dimColor>
        Registry currently lists {count} command descriptor(s) (stubs).
      </Text>
      <Text dimColor>
        Try: ffkity image | ffkity audio | ffkity video | ffkity serve | ffkity mcp
      </Text>
    </Box>
  );
}
