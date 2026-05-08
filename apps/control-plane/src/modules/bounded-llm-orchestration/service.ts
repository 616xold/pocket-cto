import type {
  EvidenceSelectionResult,
  EvidenceToolResponse,
  LlmOutput,
} from "@pocket-cto/domain";
import { QueryPlanner, type QueryPlannerInput } from "./planner";
import {
  selectEvidenceFromToolResponses,
  type EvidenceSelectionOutcome,
} from "./selection";
import {
  buildBoundedEvidenceSummaryOutput,
  type BoundedSummaryInput,
} from "./summary";

export class BoundedLlmOrchestrationService {
  private readonly planner = new QueryPlanner();

  plan(input: QueryPlannerInput): LlmOutput {
    return this.planner.plan(input);
  }

  selectEvidence(input: {
    companyKey: string;
    originalText: string;
    query: string;
    responses: EvidenceToolResponse<unknown>[];
    timestamp: string;
  }): EvidenceSelectionOutcome {
    return selectEvidenceFromToolResponses(input);
  }

  summarize(input: Omit<BoundedSummaryInput, "selection"> & {
    selection: EvidenceSelectionResult;
  }): LlmOutput {
    return buildBoundedEvidenceSummaryOutput(input);
  }
}
