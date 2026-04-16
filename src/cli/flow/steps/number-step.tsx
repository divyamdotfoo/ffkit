import React from "react";

import { TextStepView } from "./text-step.tsx";

interface NumberStepViewProps {
  title: string;
  helpText?: string;
  value: string;
}

export function NumberStepView({ title, helpText, value }: NumberStepViewProps) {
  return <TextStepView title={title} helpText={helpText} value={value} />;
}
