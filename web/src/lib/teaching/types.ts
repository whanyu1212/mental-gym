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
  [key: string]: unknown;
};
