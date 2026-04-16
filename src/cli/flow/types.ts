import type { ExecutionResult } from "../../core/executor.ts";

export interface FlowState {
  values: Record<string, unknown>;
  executionResult?: ExecutionResult;
}

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  nextStepId?: string;
}

export interface StepBase {
  id: string;
  title: string;
  helpText?: string;
}

export interface FileStep extends StepBase {
  type: "file";
  valueKey: string;
  required?: boolean;
  defaultValue?: (state: FlowState) => string;
  pickerTitle?: string;
  resolveNextStepId: (state: FlowState) => string;
}

export interface SelectStep extends StepBase {
  type: "select";
  options: SelectOption[];
  valueKey?: string;
  resolveNextStepId?: (value: string, state: FlowState) => string;
}

export interface TextStep extends StepBase {
  type: "text";
  valueKey: string;
  defaultValue?: (state: FlowState) => string;
  required?: boolean;
  resolveNextStepId: (state: FlowState) => string;
}

export interface NumberStep extends StepBase {
  type: "number";
  valueKey: string;
  defaultValue?: (state: FlowState) => string;
  min?: number;
  max?: number;
  resolveNextStepId: (state: FlowState) => string;
}

export interface ExecuteStep extends StepBase {
  type: "execute";
  resolveCommandId: (state: FlowState) => string;
  buildParams: (state: FlowState) => Record<string, unknown>;
  resolveNextStepId: (state: FlowState, result: ExecutionResult) => string;
}

export interface ResultStep extends StepBase {
  type: "result";
  resolveLines: (state: FlowState) => string[];
}

export type FlowStep = SelectStep | TextStep | FileStep | NumberStep | ExecuteStep | ResultStep;

export interface FlowDefinition {
  id: string;
  title: string;
  subtitle?: string;
  initialStepId: string;
  steps: Record<string, FlowStep>;
  initialValues?: Record<string, unknown>;
}
