import React from "react";

import { createAudioFlowDefinition } from "./definitions/audio/index.ts";
import { FlowRunner } from "./runner.tsx";
import type { Category } from "../../types.ts";

interface FlowScreenProps {
  startAtAudio?: boolean;
  startScope?: Category;
}

export function FlowScreen({ startAtAudio = false, startScope }: FlowScreenProps) {
  const definition = createAudioFlowDefinition({
    startAtScopeSelect: !startAtAudio && !startScope,
    startScope,
  });
  return <FlowRunner definition={definition} />;
}
