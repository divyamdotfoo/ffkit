import { Box, Text, useApp, useInput } from "ink";
import React, { useEffect, useMemo, useState } from "react";

import { getCommand } from "../../core/command-registry.ts";
import { executeCommand } from "../../core/executor.ts";
import { Header, MutedLine, Stack } from "../theme/primitives.tsx";
import { palette, symbols } from "../theme/tokens.ts";
import { pickFilePath } from "./file-picker.ts";
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
  const [pickingFile, setPickingFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const currentStep = definition.steps[currentStepId];

  useEffect(() => {
    setCursor(0);
    setErrorMessage(undefined);
    if (currentStep?.type === "text" || currentStep?.type === "number" || currentStep?.type === "file") {
      const defaultValue = currentStep.defaultValue?.(state);
      const existing = state.values[currentStep.valueKey];
      setTextInput(typeof existing === "string" ? existing : defaultValue ?? "");
      return;
    }
    setTextInput("");
  }, [currentStepId]);

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
      if (key.upArrow) {
        setCursor((value) => Math.max(0, value - 1));
        return;
      }
      if (key.downArrow) {
        setCursor((value) => Math.min(currentStep.options.length - 1, value + 1));
        return;
      }
      if (key.return) {
        const option = currentStep.options[cursor];
        if (!option) {
          return;
        }
        const nextValues = {
          ...state.values,
          ...(currentStep.valueKey ? { [currentStep.valueKey]: option.value } : {}),
        };
        setState((prev) => ({ ...prev, values: nextValues }));
        appendAnswerHistory(
          setAnswerHistory,
          currentStep.id,
          currentStep.title,
          option.label,
        );
        const nextStepId =
          option.nextStepId ??
          currentStep.resolveNextStepId?.(option.value, { ...state, values: nextValues });
        if (nextStepId) {
          transitionToNextStep(currentStepId, nextStepId, setStepHistory, setCurrentStepId);
        }
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
      if (currentStep.type === "file") {
        const trimmed = textInput.trim();
        if (trimmed.length > 0) {
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
      {renderStep(currentStep, state, cursor, textInput, running)}
      {errorMessage ? <Text color={palette.danger}>{errorMessage}</Text> : null}
      <MutedLine>Press B to go back to the previous menu or Q to quit.</MutedLine>
    </Stack>
  );
}

function renderStep(
  step: FlowStep | undefined,
  state: FlowState,
  cursor: number,
  textInput: string,
  running: boolean,
) {
  if (!step) {
    return <Text color={palette.danger}>Flow step is missing.</Text>;
  }
  if (step.type === "select") {
    return <SelectStepView step={step} selectedIndex={cursor} />;
  }
  if (step.type === "text") {
    return <TextStepView title={step.title} helpText={step.helpText} value={textInput} />;
  }
  if (step.type === "file") {
    return (
      <TextStepView
        title={step.title}
        helpText={step.helpText ?? "Press Enter to open the file picker, or paste a full path manually."}
        value={textInput}
      />
    );
  }
  if (step.type === "number") {
    return <NumberStepView title={step.title} helpText={step.helpText} value={textInput} />;
  }
  if (step.type === "execute") {
    return (
      <Box flexDirection="row" columnGap={1}>
        <Text color={palette.warn}>{symbols.spinner}</Text>
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
