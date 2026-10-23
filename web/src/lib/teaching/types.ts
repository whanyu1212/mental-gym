export type TeachingAction =
  | "compare"
  | "write"
  | "discard"
  | "confirm"
  | "expand"
  | "shrink"
  | "swap"
  | "derive";

export type FormulaTone = "accent" | "info" | "success" | "danger" | "muted";

export type FormulaToken = {
  id: string;
  text: string;
  tone?: FormulaTone;
};

export type FormulaSpec = {
  mode?: "inline" | "block";
  latex?: string;
  tokens?: FormulaToken[];
  emphasis?: string[];
};

export type HighlightKind =
  | "focus"
  | "compare"
  | "candidate"
  | "write"
  | "discard"
  | "match"
  | "region-add"
  | "region-subtract"
  | "confirmed";

export type HighlightSpec = {
  target: string;
  kind: HighlightKind;
  label?: string;
};

export type CalloutSpec = {
  title?: string;
  body: string;
  tone?: "info" | "success" | "warning" | "danger";
};

export type TeachingStep = {
  id?: string;
  phase?: string;
  exp: string;
  reason?: string;
  invariant?: string | string[];
  action?: TeachingAction;
  formula?: FormulaSpec | string;
  highlights?: HighlightSpec[];
  callout?: CalloutSpec;
  // Each animation adds its own step fields (pointer indices, partial results,
  // and so on) that the framework cannot enumerate. `any` rather than `unknown`
  // so components can read them without casting at every use.
  [key: string]: any;
};

/**
 * Payload of the `step-change` event that `AlgorithmPlayer` dispatches on each
 * navigation. Declared on the global element event map so animation components
 * get a typed `event.detail` without casting at every listener.
 */
export type StepChangeDetail = {
  step: TeachingStep;
  index: number;
};

export type StepChangeEvent = CustomEvent<StepChangeDetail>;

declare global {
  interface HTMLElementEventMap {
    "step-change": StepChangeEvent;
  }
}
