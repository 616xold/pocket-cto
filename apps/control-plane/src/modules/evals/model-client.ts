import type {
  EvalModelClientFormat,
  EvalOutputRecord,
} from "./types";

export type EvalModelGenerateInput = {
  format: EvalModelClientFormat;
  model: string;
  prompt: string;
};

export interface EvalModelClient {
  generate(input: EvalModelGenerateInput): Promise<
    Pick<EvalOutputRecord, "output" | "provider" | "text">
  >;
}
