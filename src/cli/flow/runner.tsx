import { Box, Text, useApp, useInput } from "ink";
import React, { useEffect, useMemo, useState } from "react";

import { getCommand } from "../../core/command-registry.ts";
import { executeCommand } from "../../core/executor.ts";
import { Header, MutedLine, Stack } from "../theme/primitives.tsx";
import { palette, symbols } from "../theme/tokens.ts";
import { pickFilePath, pickFilePaths, splitPickedPaths } from "./file-picker.ts";
import { NumberStepView } from "./steps/number-step.tsx";
import { ResultStepView } from "./steps/result-step.tsx";
import { SelectStepView } from "./steps/select-step.tsx";
import { TextStepView } from "./steps/text-step.tsx";
import type { FlowDefinition, FlowState, FlowStep } from "./types.ts";

interface FlowRunnerProps {
  definition: FlowDefinition;
}

interface AnswerEntry {
  stepId: string;
  question: string;
  value: string;
}

export function FlowRunner({ definition }: FlowRunnerProps) {
  const { exit } = useApp();
  const [state, setState] = useState<FlowState>({
    values: { ...(definition.initialValues ?? {}) },
  });
  const [currentStepId, setCurrentStepId] = useState(definition.initialStepId);
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [answerHistory, setAnswerHistory] = useState<AnswerEntry[]>([]);
  const [cursor, setCursor] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [running, setRunning] = useState(false);
  const [loaderFrameIndex, setLoaderFrameIndex] = useState(0);
  const [pickingFile, setPickingFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const currentStep = definition.steps[currentStepId];

  useEffect(() => {
    setCursor(0);
    setErrorMessage(undefined);
    if (currentStep?.type === "text" || currentStep?.type === "number" || currentStep?.type === "file") {
      const defaultValue = currentStep.defaultValue?.(state);
      const existing = state.values[currentStep.valueKey];
      if (currentStep.type === "file" && currentStep.multiSelect && Array.isArray(existing)) {
        setTextInput(existing.join("\n"));
        return;
      }
      setTextInput(typeof existing === "string" ? existing : defaultValue ?? "");
      return;
    }
    setTextInput("");
  }, [currentStepId]);

  const dynamicSelectOptionsLength =
    currentStep?.type === "select" && currentStep.resolveDynamicOptions
      ? (() => {
          const opts = currentStep.resolveDynamicOptions(state);
          return opts.length;
        })()
      : 0;

  useEffect(() => {
    if (currentStep?.type !== "select") {
      return;
    }
    const options = resolveSelectDisplayOptions(currentStep, state);
    if (options.length === 0) {
      return;
    }
    setCursor((previous) => Math.min(previous, options.length - 1));
  }, [currentStepId, dynamicSelectOptionsLength]);

  useEffect(() => {
    if (currentStep?.type !== "file" || !currentStep.multiSelect || !currentStep.multiSelectOrderResetKeys?.length) {
      return;
    }
    const resetKeys = currentStep.multiSelectOrderResetKeys;
    setState((previous) => {
      let changed = false;
      const values = { ...previous.values };
      for (const key of resetKeys) {
        const ordered = values[key];
        if (Array.isArray(ordered) && ordered.length > 0) {
          values[key] = [];
          changed = true;
        }
      }
      return changed ? { ...previous, values } : previous;
    });
  }, [currentStepId, currentStep?.id, currentStep?.type]);

  useEffect(() => {
    if (!currentStep || currentStep.type !== "execute" || running) {
      return;
    }
    setRunning(true);
    void runExecutionStep(currentStep, state, definition, setState, (nextStepId) =>
      transitionToNextStep(currentStepId, nextStepId, setStepHistory, setCurrentStepId),
    ).finally(() => {
      setRunning(false);
    });
  }, [currentStepId, running]);

  useEffect(() => {
    if (!running || currentStep?.type !== "execute") {
      setLoaderFrameIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setLoaderFrameIndex((value) => (value + 1) % EXECUTE_LOADER_FRAMES.length);
    }, 90);
    return () => {
      clearInterval(timer);
    };
  }, [running, currentStep?.type]);

  useInput((input, key) => {
    if (key.escape || input === "q") {
      exit();
      return;
    }
    if (input === "b" && stepHistory.length > 0) {
      navigateBack(setStepHistory, setCurrentStepId);
      return;
    }
    if (!currentStep || running || currentStep.type === "execute" || pickingFile) {
      return;
    }

    if (currentStep.type === "select") {
      const displayOptions = resolveSelectDisplayOptions(currentStep, state);
      if (key.upArrow) {
        setCursor((value) => Math.max(0, value - 1));
        return;
      }
      if (key.downArrow) {
        setCursor((value) => Math.min(displayOptions.length - 1, value + 1));
        return;
      }
      if (key.return) {
        const option = displayOptions[cursor];
        if (!option) {
          return;
        }
        const accumulateKey = currentStep.accumulateSelectionToKey;
        const nextValues =
          accumulateKey !== undefined
            ? {
                ...state.values,
                [accumulateKey]: [
                  ...(Array.isArray(state.values[accumulateKey])
                    ? (state.values[accumulateKey] as string[])
                    : []),
                  option.value,
                ],
              }
            : {
                ...state.values,
                ...(currentStep.valueKey ? { [currentStep.valueKey]: option.value } : {}),
              };
        const nextState: FlowState = { ...state, values: nextValues };
        setState((prev) => ({ ...prev, values: nextValues }));
        const historyStepId =
          accumulateKey !== undefined
            ? `${currentStep.id}#${(nextValues[accumulateKey] as string[]).length}`
            : currentStep.id;
        const historyQuestion =
          currentStep.resolveDynamicTitle?.(nextState) ?? currentStep.title;
        appendAnswerHistory(setAnswerHistory, historyStepId, historyQuestion, option.label);
        const nextStepId =
          option.nextStepId ?? currentStep.resolveNextStepId?.(option.value, nextState);
        if (!nextStepId) {
          return;
        }
        if (nextStepId === currentStepId) {
          setCursor(0);
          return;
        }
        transitionToNextStep(currentStepId, nextStepId, setStepHistory, setCurrentStepId);
      }
      return;
    }

    if (currentStep.type === "result") {
      if (key.return) {
        exit();
      }
      return;
    }

    if (key.backspace || key.delete) {
      setTextInput((value) => value.slice(0, -1));
      return;
    }
    if (key.return) {
      if (currentStep.type === "text") {
        const trimmed = textInput.trim();
        if (currentStep.required !== false && trimmed.length === 0) {
          setErrorMessage("This field is required.");
          return;
        }
        let resolved = trimmed;
        if (resolved.length === 0 && currentStep.defaultValue !== undefined) {
          resolved = currentStep
            .defaultValue({ ...state, values: { ...state.values, [currentStep.valueKey]: "" } })
            .trim();
        }
        const nextValues = { ...state.values, [currentStep.valueKey]: resolved };
        setState((prev) => ({ ...prev, values: nextValues }));
        appendAnswerHistory(setAnswerHistory, currentStep.id, currentStep.title, resolved);
        transitionToNextStep(
          currentStepId,
          currentStep.resolveNextStepId({ ...state, values: nextValues }),
          setStepHistory,
          setCurrentStepId,
        );
        return;
      }
      if (currentStep.type === "file") {
        const trimmed = textInput.trim();
        if (trimmed.length > 0) {
          if (currentStep.multiSelect) {
            const paths = splitPickedPaths(trimmed);
            const minFiles = currentStep.minFiles ?? 2;
            if (paths.length < minFiles) {
              setErrorMessage(`Enter at least ${minFiles} paths (one per line or separated by |).`);
              return;
            }
            const nextValues = buildMultiSelectPickValues(state.values, currentStep.valueKey, paths, currentStep.multiSelectOrderResetKeys);
            setState((prev) => ({ ...prev, values: nextValues }));
            appendAnswerHistory(setAnswerHistory, currentStep.id, currentStep.title, `${paths.length} files`);
            transitionToNextStep(
              currentStepId,
              currentStep.resolveNextStepId({ ...state, values: nextValues }),
              setStepHistory,
              setCurrentStepId,
            );
            return;
          }
          const nextValues = { ...state.values, [currentStep.valueKey]: trimmed };
          setState((prev) => ({ ...prev, values: nextValues }));
          appendAnswerHistory(setAnswerHistory, currentStep.id, currentStep.title, trimmed);
          transitionToNextStep(
            currentStepId,
            currentStep.resolveNextStepId({ ...state, values: nextValues }),
            setStepHistory,
            setCurrentStepId,
          );
          return;
        }
        void openPickerAndAdvance({
          currentStep,
          state,
          currentStepId,
          definition,
          setPickingFile,
          setErrorMessage,
          setState,
          setAnswerHistory,
          setStepHistory,
          setCurrentStepId,
        });
        return;
      }
      if (currentStep.type === "number") {
        const numericValue = Number(textInput.trim());
        if (Number.isNaN(numericValue)) {
          setErrorMessage("Enter a valid number.");
          return;
        }
        if (typeof currentStep.min === "number" && numericValue < currentStep.min) {
          setErrorMessage(`Must be >= ${currentStep.min}.`);
          return;
        }
        if (typeof currentStep.max === "number" && numericValue > currentStep.max) {
          setErrorMessage(`Must be <= ${currentStep.max}.`);
          return;
        }
        const nextValues = { ...state.values, [currentStep.valueKey]: numericValue };
        setState((prev) => ({ ...prev, values: nextValues }));
        appendAnswerHistory(
          setAnswerHistory,
          currentStep.id,
          currentStep.title,
          `${numericValue}`,
        );
        transitionToNextStep(
          currentStepId,
          currentStep.resolveNextStepId({ ...state, values: nextValues }),
          setStepHistory,
          setCurrentStepId,
        );
      }
      return;
    }

    if (input.length === 1 && !key.ctrl && !key.meta) {
      setTextInput((value) => value + input);
    }
  });

  const subtitle = useMemo(
    () => definition.subtitle ?? "Use arrows + Enter to continue.",
    [definition.subtitle],
  );

  return (
    <Stack rowGap={1}>
      <Header title="ffkity" version="v0.0.1" meta={definition.title} />
      <MutedLine>{subtitle}</MutedLine>
      {answerHistory.length > 0 ? (
        <Stack rowGap={0}>
          <Text color={palette.accentBlue}>Your selections</Text>
          {answerHistory.map((entry) => (
            <Box key={entry.stepId} flexDirection="row" columnGap={1}>
              <Text color={palette.text}>{entry.question}:</Text>
              <Text color={palette.success}>{entry.value};</Text>
            </Box>
          ))}
        </Stack>
      ) : null}
      {renderStep(currentStep, state, cursor, textInput, running, loaderFrameIndex)}
      {errorMessage ? <Text color={palette.danger}>{errorMessage}</Text> : null}
      <MutedLine>Press B to go back to the previous menu or Q to quit.</MutedLine>
    </Stack>
  );
}

function resolveSelectDisplayOptions(step: Extract<FlowStep, { type: "select" }>, state: FlowState) {
  return step.resolveDynamicOptions?.(state) ?? step.options;
}

function buildMultiSelectPickValues(
  baseValues: Record<string, unknown>,
  valueKey: string,
  paths: string[],
  resetKeys?: string[],
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...baseValues, [valueKey]: paths };
  for (const key of resetKeys ?? []) {
    next[key] = [];
  }
  return next;
}

function renderStep(
  step: FlowStep | undefined,
  state: FlowState,
  cursor: number,
  textInput: string,
  running: boolean,
  loaderFrameIndex: number,
) {
  if (!step) {
    return <Text color={palette.danger}>Flow step is missing.</Text>;
  }
  if (step.type === "select") {
    const displayOptions = resolveSelectDisplayOptions(step, state);
    const displayTitle = step.resolveDynamicTitle?.(state) ?? step.title;
    const displayHelpText =
      step.resolveDynamicHelpText !== undefined ? step.resolveDynamicHelpText(state) : step.helpText;
    return (
      <SelectStepView
        step={step}
        selectedIndex={cursor}
        displayOptions={displayOptions}
        displayTitle={displayTitle}
        displayHelpText={displayHelpText}
      />
    );
  }
  if (step.type === "text") {
    return <TextStepView title={step.title} helpText={step.helpText} value={textInput} />;
  }
  if (step.type === "file") {
    const fileHelp =
      step.helpText ??
      (step.multiSelect
        ? "Press Enter for multi-file picker, or paste paths (one per line or separated by |)."
        : "Press Enter to open the file picker, or paste a full path manually.");
    return <TextStepView title={step.title} helpText={fileHelp} value={textInput} />;
  }
  if (step.type === "number") {
    return <NumberStepView title={step.title} helpText={step.helpText} value={textInput} />;
  }
  if (step.type === "execute") {
    const loaderFrame = EXECUTE_LOADER_FRAMES[loaderFrameIndex] ?? EXECUTE_LOADER_FRAMES[0];
    return (
      <Box flexDirection="row" columnGap={1}>
        <Text color={palette.warn}>{loaderFrame}</Text>
        <Text color={palette.text}>{running ? "Running ffmpeg..." : "Preparing..."}</Text>
      </Box>
    );
  }
  return <ResultStepView success={state.executionResult?.success ?? false} lines={step.resolveLines(state)} />;
}

async function runExecutionStep(
  step: Extract<FlowStep, { type: "execute" }>,
  state: FlowState,
  definition: FlowDefinition,
  setState: React.Dispatch<React.SetStateAction<FlowState>>,
  goToNextStep: (nextStepId: string) => void,
): Promise<void> {
  const commandId = step.resolveCommandId(state);
  const command = getCommand(commandId);
  if (!command) {
    setState((prev) => ({
      ...prev,
      executionResult: { success: false, message: `Unknown command: ${commandId}` },
    }));
    goToNextStep(step.resolveNextStepId(state, { success: false, message: `Unknown command: ${commandId}` }));
    return;
  }

  const result = await executeCommand(command, step.buildParams(state));
  const nextState: FlowState = {
    ...state,
    executionResult: result,
  };
  setState(nextState);
  const nextStepId = step.resolveNextStepId(nextState, result);
  goToNextStep(definition.steps[nextStepId] ? nextStepId : definition.initialStepId);
}

const EXECUTE_LOADER_FRAMES = [
  "<( ^_^ )>  .  .  .  ffmpeg",
  "<( ^_^ )>  o  .  .  ffmpeg",
  "<( ^_^ )>  O  o  .  ffmpeg",
  "<( ^_^ )>  @  O  o  ffmpeg",
  "<( ^_^ )>  #  @  O  ffmpeg",
  "<( ^_^ )>  @  O  o  ffmpeg",
  "<( ^_^ )>  O  o  .  ffmpeg",
  "<( ^_^ )>  o  .  .  ffmpeg",
] as const;

function transitionToNextStep(
  currentStepId: string,
  nextStepId: string,
  setStepHistory: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentStepId: React.Dispatch<React.SetStateAction<string>>,
): void {
  setStepHistory((previous) => [...previous, currentStepId]);
  setCurrentStepId(nextStepId);
}

function navigateBack(
  setStepHistory: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentStepId: React.Dispatch<React.SetStateAction<string>>,
): void {
  setStepHistory((previous) => {
    if (previous.length === 0) {
      return previous;
    }
    const next = [...previous];
    const priorStepId = next.pop();
    if (priorStepId) {
      setCurrentStepId(priorStepId);
    }
    return next;
  });
}

function appendAnswerHistory(
  setAnswerHistory: React.Dispatch<React.SetStateAction<AnswerEntry[]>>,
  stepId: string,
  question: string,
  value: string,
): void {
  setAnswerHistory((previous) => {
    const existingIndex = previous.findIndex((entry) => entry.stepId === stepId);
    if (existingIndex === -1) {
      return [...previous, { stepId, question, value }];
    }
    const next = [...previous];
    next[existingIndex] = { stepId, question, value };
    return next;
  });
}

async function openPickerAndAdvance(input: {
  currentStep: Extract<FlowStep, { type: "file" }>;
  state: FlowState;
  currentStepId: string;
  definition: FlowDefinition;
  setPickingFile: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setState: React.Dispatch<React.SetStateAction<FlowState>>;
  setAnswerHistory: React.Dispatch<React.SetStateAction<AnswerEntry[]>>;
  setStepHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentStepId: React.Dispatch<React.SetStateAction<string>>;
}): Promise<void> {
  input.setPickingFile(true);
  input.setErrorMessage(undefined);

  if (input.currentStep.multiSelect) {
    const picked = pickFilePaths(input.currentStep.pickerTitle ?? "Choose input files");
    input.setPickingFile(false);
    const minFiles = input.currentStep.minFiles ?? 2;
    if (picked.length < minFiles) {
      input.setErrorMessage(
        picked.length === 0
          ? "File picker cancelled or unavailable. Paste full paths (one per line), or try again."
          : `Pick at least ${minFiles} files (selected ${picked.length}).`,
      );
      return;
    }
    const nextValues = buildMultiSelectPickValues(
      input.state.values,
      input.currentStep.valueKey,
      picked,
      input.currentStep.multiSelectOrderResetKeys,
    );
    input.setState((previous) => ({ ...previous, values: nextValues }));
    appendAnswerHistory(
      input.setAnswerHistory,
      input.currentStep.id,
      input.currentStep.title,
      `${picked.length} files`,
    );
    const nextStepId = input.currentStep.resolveNextStepId({ ...input.state, values: nextValues });
    if (!input.definition.steps[nextStepId]) {
      input.setCurrentStepId(input.definition.initialStepId);
      return;
    }
    transitionToNextStep(input.currentStepId, nextStepId, input.setStepHistory, input.setCurrentStepId);
    return;
  }

  const picked = pickFilePath(input.currentStep.pickerTitle ?? "Choose input file");
  input.setPickingFile(false);

  if (!picked) {
    input.setErrorMessage("File picker cancelled or unavailable. Paste a full path manually.");
    return;
  }

  const nextValues = {
    ...input.state.values,
    [input.currentStep.valueKey]: picked,
  };
  input.setState((previous) => ({ ...previous, values: nextValues }));
  appendAnswerHistory(input.setAnswerHistory, input.currentStep.id, input.currentStep.title, picked);
  const nextStepId = input.currentStep.resolveNextStepId({ ...input.state, values: nextValues });
  if (!input.definition.steps[nextStepId]) {
    input.setCurrentStepId(input.definition.initialStepId);
    return;
  }
  transitionToNextStep(
    input.currentStepId,
    nextStepId,
    input.setStepHistory,
    input.setCurrentStepId,
  );
}
