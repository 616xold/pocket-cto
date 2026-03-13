import { MissionSpecSchema } from "@pocket-cto/domain";
import type {
  CompilerEvalExpectations,
  TextEvalExpectations,
} from "./dataset";
import type { DimensionScores, RuleAssessment } from "./types";

export function evaluateTextOutput(input: {
  expectations: TextEvalExpectations;
  output: string;
}): RuleAssessment {
  const rawOutput = input.output.replace(/\r\n/g, "\n").trim();
  const normalizedOutput = normalize(rawOutput);

  if (!rawOutput) {
    return {
      checks: {
        passed: 0,
        total: 1,
      },
      notes: ["The candidate output was empty."],
      scores: zeroScores(),
    };
  }

  const missingSections = input.expectations.requiredSections.filter(
    (section) => !hasMarkdownSection(rawOutput, section),
  );
  const missingMentions = input.expectations.mustMention.filter(
    (phrase) => !includesNormalized(normalizedOutput, phrase),
  );
  const forbiddenHits = input.expectations.forbiddenPhrases.filter((phrase) =>
    includesNormalized(normalizedOutput, phrase),
  );
  const missingEvidenceSignals = input.expectations.evidenceSignals.filter(
    (signal) => !includesNormalized(normalizedOutput, signal),
  );
  const missingActionabilitySignals =
    input.expectations.actionabilitySignals.filter(
      (signal) => !includesNormalized(normalizedOutput, signal),
    );

  const sectionCoverage = ratio(
    input.expectations.requiredSections.length - missingSections.length,
    input.expectations.requiredSections.length,
  );
  const mentionCoverage = ratio(
    input.expectations.mustMention.length - missingMentions.length,
    input.expectations.mustMention.length,
  );
  const evidenceCoverage = ratio(
    input.expectations.evidenceSignals.length - missingEvidenceSignals.length,
    input.expectations.evidenceSignals.length,
  );
  const actionabilityCoverage = ratio(
    input.expectations.actionabilitySignals.length -
      missingActionabilitySignals.length,
    input.expectations.actionabilitySignals.length,
  );
  const forbiddenCoverage =
    input.expectations.forbiddenPhrases.length === 0
      ? 1
      : ratio(
          input.expectations.forbiddenPhrases.length - forbiddenHits.length,
          input.expectations.forbiddenPhrases.length,
        );
  const boundedLengthCoverage =
    rawOutput.length >= 120 && rawOutput.length <= 3000 ? 1 : 0.6;

  const scores = {
    actionability: toFivePointScale(
      average([sectionCoverage, mentionCoverage, actionabilityCoverage]),
    ),
    clarity: toFivePointScale(average([sectionCoverage, boundedLengthCoverage])),
    constraintCompliance: toFivePointScale(
      average([sectionCoverage, mentionCoverage, forbiddenCoverage]),
    ),
    evidenceReadiness: toFivePointScale(
      average([sectionCoverage, evidenceCoverage]),
    ),
  } satisfies DimensionScores;

  const notes = [
    ...missingSections.map((section) => `Missing required section: ${section}.`),
    ...missingMentions.map((phrase) => `Missing expected topic: ${phrase}.`),
    ...forbiddenHits.map((phrase) => `Forbidden phrase present: ${phrase}.`),
    ...missingEvidenceSignals.map(
      (signal) => `Evidence signal not found: ${signal}.`,
    ),
    ...missingActionabilitySignals.map(
      (signal) => `Actionability signal not found: ${signal}.`,
    ),
  ];

  const totalChecks =
    input.expectations.requiredSections.length +
    input.expectations.mustMention.length +
    input.expectations.forbiddenPhrases.length +
    input.expectations.evidenceSignals.length +
    input.expectations.actionabilitySignals.length;

  return {
    checks: {
      passed:
        totalChecks -
        missingSections.length -
        missingMentions.length -
        forbiddenHits.length -
        missingEvidenceSignals.length -
        missingActionabilitySignals.length,
      total: totalChecks || 1,
    },
    notes,
    scores,
  };
}

export function evaluateCompilerOutput(input: {
  expectations: CompilerEvalExpectations;
  output: unknown;
  outputText: string;
}): RuleAssessment {
  const schemaResult = MissionSpecSchema.safeParse(normalizeCompilerOutput(input.output));

  if (!schemaResult.success) {
    return {
      checks: {
        passed: 0,
        total: 1,
      },
      notes: ["The compiler candidate did not produce a valid MissionSpec JSON object."],
      scores: {
        actionability: 0,
        clarity: 1,
        constraintCompliance: 0,
        evidenceReadiness: 0,
      },
    };
  }

  const spec = schemaResult.data;
  const missingRepos = input.expectations.expectedRepos.filter(
    (repo) => !includesValue(spec.repos, repo),
  );
  const missingAllowedPaths = input.expectations.expectedAllowedPaths.filter(
    (path) => !includesValue(spec.constraints.allowedPaths, path),
  );
  const missingMustNot = input.expectations.expectedMustNot.filter(
    (value) => !arrayContainsPhrase(spec.constraints.mustNot, value),
  );
  const missingDeliverables = input.expectations.requiredDeliverables.filter(
    (value) => !includesValue(spec.deliverables, value),
  );
  const missingEvidenceRequirements =
    input.expectations.requiredEvidenceRequirements.filter(
      (value) => !arrayContainsPhrase(spec.evidenceRequirements, value),
    );
  const missingAcceptancePhrases =
    input.expectations.requiredAcceptancePhrases.filter(
      (value) => !arrayContainsPhrase(spec.acceptance, value),
    );

  const typeMatch = spec.type === input.expectations.expectedType ? 1 : 0;
  const repoCoverage = ratio(
    input.expectations.expectedRepos.length - missingRepos.length,
    input.expectations.expectedRepos.length,
  );
  const allowedPathCoverage = ratio(
    input.expectations.expectedAllowedPaths.length - missingAllowedPaths.length,
    input.expectations.expectedAllowedPaths.length,
  );
  const mustNotCoverage = ratio(
    input.expectations.expectedMustNot.length - missingMustNot.length,
    input.expectations.expectedMustNot.length,
  );
  const deliverableCoverage = ratio(
    input.expectations.requiredDeliverables.length - missingDeliverables.length,
    input.expectations.requiredDeliverables.length,
  );
  const evidenceCoverage = ratio(
    input.expectations.requiredEvidenceRequirements.length -
      missingEvidenceRequirements.length,
    input.expectations.requiredEvidenceRequirements.length,
  );
  const acceptanceCoverage = ratio(
    input.expectations.requiredAcceptancePhrases.length -
      missingAcceptancePhrases.length,
    input.expectations.requiredAcceptancePhrases.length,
  );
  const clarityCoverage =
    spec.title.trim().length > 0 &&
    spec.objective.trim().length > 0 &&
    input.outputText.length <= 5000
      ? 1
      : 0.7;

  return {
    checks: {
      passed:
        Number(typeMatch === 1) +
        input.expectations.expectedRepos.length -
        missingRepos.length +
        input.expectations.expectedAllowedPaths.length -
        missingAllowedPaths.length +
        input.expectations.expectedMustNot.length -
        missingMustNot.length +
        input.expectations.requiredDeliverables.length -
        missingDeliverables.length +
        input.expectations.requiredEvidenceRequirements.length -
        missingEvidenceRequirements.length +
        input.expectations.requiredAcceptancePhrases.length -
        missingAcceptancePhrases.length,
      total:
        1 +
        input.expectations.expectedRepos.length +
        input.expectations.expectedAllowedPaths.length +
        input.expectations.expectedMustNot.length +
        input.expectations.requiredDeliverables.length +
        input.expectations.requiredEvidenceRequirements.length +
        input.expectations.requiredAcceptancePhrases.length,
    },
    notes: [
      ...(typeMatch === 1
        ? []
        : [
            `Expected mission type ${input.expectations.expectedType}, received ${spec.type}.`,
          ]),
      ...missingRepos.map((repo) => `Missing expected repo: ${repo}.`),
      ...missingAllowedPaths.map(
        (path) => `Missing expected allowed path: ${path}.`,
      ),
      ...missingMustNot.map((value) => `Missing expected must-not rule: ${value}.`),
      ...missingDeliverables.map(
        (value) => `Missing expected deliverable: ${value}.`,
      ),
      ...missingEvidenceRequirements.map(
        (value) => `Missing expected evidence requirement: ${value}.`,
      ),
      ...missingAcceptancePhrases.map(
        (value) => `Missing expected acceptance phrase: ${value}.`,
      ),
    ],
    scores: {
      actionability: toFivePointScale(average([repoCoverage, acceptanceCoverage])),
      clarity: toFivePointScale(clarityCoverage),
      constraintCompliance: toFivePointScale(
        average([typeMatch, allowedPathCoverage, mustNotCoverage]),
      ),
      evidenceReadiness: toFivePointScale(
        average([deliverableCoverage, evidenceCoverage]),
      ),
    },
  };
}

function normalizeCompilerOutput(output: unknown) {
  if (!isRecord(output)) {
    return output;
  }

  const constraints = isRecord(output.constraints) ? output.constraints : null;

  if (!constraints || constraints.targetBranch !== null) {
    return output;
  }

  return {
    ...output,
    constraints: {
      ...constraints,
      targetBranch: undefined,
    },
  };
}

function hasMarkdownSection(output: string, section: string) {
  return new RegExp(`(?:^|\\n)##\\s*${escapeRegExp(section)}\\s*(?:\\n|$)`, "i").test(
    output,
  );
}

function includesNormalized(output: string, phrase: string) {
  return normalize(output).includes(normalize(phrase));
}

function includesValue(values: string[], expected: string) {
  const normalized = normalize(expected);
  return values.some((value) => normalize(value) === normalized);
}

function arrayContainsPhrase(values: string[], expected: string) {
  const normalized = normalize(expected);
  return values.some((value) => normalize(value).includes(normalized));
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 1;
  }

  return Math.max(0, Math.min(1, numerator / denominator));
}

function toFivePointScale(value: number) {
  return roundOneDecimal(Math.max(0, Math.min(1, value)) * 5);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function zeroScores(): DimensionScores {
  return {
    actionability: 0,
    clarity: 0,
    constraintCompliance: 0,
    evidenceReadiness: 0,
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
