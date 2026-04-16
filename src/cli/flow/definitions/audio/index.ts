import { listCommandsByCategory } from "../../../../core/command-registry.ts";
import type { Category } from "../../../../types.ts";
import type { FlowDefinition, FlowState, FlowStep } from "../../types.ts";
import { getAudioConvertExecutionParams, getAudioConvertSteps } from "./convert.ts";
import { getAudioNormalizeExecutionParams, getAudioNormalizeSteps } from "./normalize.ts";
import { getAudioTrimExecutionParams, getAudioTrimSteps } from "./trim.ts";

interface AudioFlowOptions {
  startAtScopeSelect: boolean;
  startScope?: Category;
}

export function createAudioFlowDefinition(options: AudioFlowOptions): FlowDefinition {
  const commandOptions = listCommandsByCategory("audio").map((command) => ({
    label: command.name,
    value: command.id,
    description: command.description,
  }));

  const flowSteps: FlowStep[] = [
    ...(options.startAtScopeSelect || options.startScope
      ? [createScopeStep(), createScopeResultStep()]
      : []),
    {
      id: "audio.command",
      type: "select",
      title: "Choose audio feature",
      valueKey: "commandId",
      options: commandOptions,
      resolveNextStepId: (value) => `${value}.inputPath`,
    },
    ...getAudioConvertSteps(),
    ...getAudioTrimSteps(),
    ...getAudioNormalizeSteps(),
    createExecuteStep(),
    createResultStep(),
  ];

  return {
    id: options.startAtScopeSelect || options.startScope ? "media-flow" : "audio-flow",
    title: options.startAtScopeSelect || options.startScope ? "Media tools" : "Audio tools",
    subtitle: "Follow the prompts to complete your operation.",
    initialStepId: getInitialStepId(options),
    initialValues: {
      ...(options.startScope ? { scope: options.startScope } : {}),
      qualityProfile: "balanced",
      encodingMode: "compatible",
      strength: "standard",
    },
    steps: toStepMap(flowSteps),
  };
}

function getInitialStepId(options: AudioFlowOptions): string {
  if (options.startScope === "audio") {
    return "audio.command";
  }
  if (options.startScope === "image" || options.startScope === "video") {
    return "root.scopeResult";
  }
  if (options.startAtScopeSelect) {
    return "root.scope";
  }
  return "audio.command";
}

function createScopeStep(): FlowStep {
  return {
    id: "root.scope",
    type: "select",
    title: "Choose media scope",
    options: [
      {
        label: "audio",
        value: "audio",
        description: "Convert, trim, and normalize audio files.",
        nextStepId: "audio.command",
      },
      {
        label: "image",
        value: "image",
        description: "Image operations will be added in upcoming steps.",
        nextStepId: "root.scopeResult",
      },
      {
        label: "video",
        value: "video",
        description: "Video operations will be added in upcoming steps.",
        nextStepId: "root.scopeResult",
      },
    ],
    valueKey: "scope",
  };
}

function createScopeResultStep(): FlowStep {
  return {
    id: "root.scopeResult",
    type: "result",
    title: "Scope status",
    resolveLines: (state) => {
      const scope = typeof state.values.scope === "string" ? state.values.scope : "Selected scope";
      if (scope === "audio") {
        return ["Opening audio commands...", "Press Enter to continue."];
      }
      return [`${scope} commands are not wired yet.`, "Press B to go back or Enter to exit."];
    },
  };
}

export function buildFlowResultLines(state: FlowState): string[] {
  const result = state.executionResult;
  const lines: string[] = [result?.message ?? "No result available."];
  const outputPath = typeof state.values.outputPath === "string" ? state.values.outputPath : "";
  if (outputPath) {
    lines.push(`Output: ${outputPath}`);
  }
  lines.push("Press Enter to exit.");
  return lines;
}

export function getCommandExecutionParams(values: Record<string, unknown>): Record<string, unknown> {
  const commandId = typeof values.commandId === "string" ? values.commandId : "";
  if (commandId === "audio_convert") {
    return getAudioConvertExecutionParams(values);
  }
  if (commandId === "audio_trim") {
    return getAudioTrimExecutionParams(values);
  }
  if (commandId === "audio_normalize") {
    return getAudioNormalizeExecutionParams(values);
  }
  return {
    inputPath: values.inputPath,
    outputPath: values.outputPath,
  };
}

function createExecuteStep(): FlowStep {
  return {
    id: "audio.execute",
    type: "execute",
    title: "Execute command",
    resolveCommandId: (state) => String(state.values.commandId ?? ""),
    buildParams: (state) => getCommandExecutionParams(state.values),
    resolveNextStepId: () => "audio.result",
  };
}

function createResultStep(): FlowStep {
  return {
    id: "audio.result",
    type: "result",
    title: "Result",
    resolveLines: (state) => buildFlowResultLines(state),
  };
}

function toStepMap(steps: FlowStep[]): Record<string, FlowStep> {
  return steps.reduce<Record<string, FlowStep>>((accumulator, step) => {
    accumulator[step.id] = step;
    return accumulator;
  }, {});
}
