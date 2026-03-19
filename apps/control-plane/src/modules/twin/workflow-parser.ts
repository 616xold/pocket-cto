import { basename, extname } from "node:path";
import { parse } from "yaml";

export type ParsedWorkflowTriggerSummary = {
  eventNames: string[];
  hasSchedule: boolean;
  hasWorkflowCall: boolean;
  hasWorkflowDispatch: boolean;
  scheduleCount: number;
};

export type ParsedWorkflowRunsOn = {
  group: string | null;
  labels: string[];
};

export type ParsedWorkflowJobPermissions = {
  mode: string | null;
  scopes: Record<string, string>;
};

export type ParsedWorkflowJobStep = {
  kind: "run" | "uses";
  name: string | null;
  value: string;
};

export type ParsedWorkflowJob = {
  key: string;
  name: string | null;
  needs: string[];
  permissions: ParsedWorkflowJobPermissions | null;
  runsOn: ParsedWorkflowRunsOn;
  stableKey: string;
  steps: ParsedWorkflowJobStep[];
};

export type ParsedWorkflowFile = {
  jobs: ParsedWorkflowJob[];
  name: string | null;
  path: string;
  resolvedName: string;
  stableKey: string;
  triggerSummary: ParsedWorkflowTriggerSummary;
};

export function parseWorkflowFile(input: {
  content: string;
  path: string;
}): ParsedWorkflowFile {
  let parsed: unknown;

  try {
    parsed = parse(input.content);
  } catch (error) {
    throw new Error(
      `Workflow file ${input.path} is not valid YAML: ${String(error)}`,
    );
  }

  const document = asObject(parsed);
  const name = readOptionalString(document.name);

  return {
    jobs: parseJobs(input.path, document.jobs),
    name,
    path: input.path,
    resolvedName: buildWorkflowResolvedName(input.path, name),
    stableKey: buildWorkflowStableKey(input.path, name),
    triggerSummary: normalizeTriggerSummary(document.on),
  };
}

export function buildWorkflowResolvedName(
  filePath: string,
  name: string | null,
) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const fileName = basename(filePath);
  const extension = extname(fileName);
  const withoutExtension =
    extension.length > 0 ? fileName.slice(0, -extension.length) : fileName;

  return withoutExtension || filePath;
}

export function buildWorkflowStableKey(filePath: string, name: string | null) {
  const trimmedName = name?.trim();

  return trimmedName ? `${filePath}#name:${trimmedName}` : `${filePath}#file`;
}

export function buildWorkflowJobStableKey(filePath: string, jobKey: string) {
  return `${filePath}#job:${jobKey}`;
}

function parseJobs(filePath: string, value: unknown): ParsedWorkflowJob[] {
  const jobs = asObject(value);

  return Object.keys(jobs)
    .sort((left, right) => left.localeCompare(right))
    .map((jobKey) => {
      const job = asObject(jobs[jobKey]);

      return {
        key: jobKey,
        name: readOptionalString(job.name),
        needs: normalizeStringList(job.needs),
        permissions: normalizePermissions(job.permissions),
        runsOn: normalizeRunsOn(job["runs-on"]),
        stableKey: buildWorkflowJobStableKey(filePath, jobKey),
        steps: normalizeSteps(job.steps),
      };
    });
}

function normalizeTriggerSummary(value: unknown): ParsedWorkflowTriggerSummary {
  if (typeof value === "string") {
    return {
      eventNames: normalizeStringList(value),
      hasSchedule: false,
      hasWorkflowCall: false,
      hasWorkflowDispatch: false,
      scheduleCount: 0,
    };
  }

  if (Array.isArray(value)) {
    return {
      eventNames: normalizeStringList(value),
      hasSchedule: false,
      hasWorkflowCall: false,
      hasWorkflowDispatch: false,
      scheduleCount: 0,
    };
  }

  const triggers = asObject(value);
  const eventNames = Object.keys(triggers)
    .filter((eventName) => eventName.trim().length > 0)
    .sort((left, right) => left.localeCompare(right));

  return {
    eventNames,
    hasSchedule: Object.hasOwn(triggers, "schedule"),
    hasWorkflowCall: Object.hasOwn(triggers, "workflow_call"),
    hasWorkflowDispatch: Object.hasOwn(triggers, "workflow_dispatch"),
    scheduleCount: readScheduleCount(triggers.schedule),
  };
}

function normalizeRunsOn(value: unknown): ParsedWorkflowRunsOn {
  if (typeof value === "string") {
    return {
      group: null,
      labels: normalizeStringList(value),
    };
  }

  if (Array.isArray(value)) {
    return {
      group: null,
      labels: normalizeStringList(value),
    };
  }

  const runsOn = asObject(value);

  return {
    group: readOptionalString(runsOn.group),
    labels: normalizeStringList(runsOn.labels),
  };
}

function normalizePermissions(
  value: unknown,
): ParsedWorkflowJobPermissions | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return {
      mode: value.trim(),
      scopes: {},
    };
  }

  if (!isPlainObject(value)) {
    return null;
  }

  const scopes = Object.fromEntries(
    Object.entries(value)
      .filter(
        (entry): entry is [string, string] =>
          entry[0].trim().length > 0 &&
          typeof entry[1] === "string" &&
          entry[1].trim().length > 0,
      )
      .sort((left, right) => left[0].localeCompare(right[0])),
  );

  return {
    mode: null,
    scopes,
  };
}

function normalizeSteps(value: unknown): ParsedWorkflowJobStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const steps: ParsedWorkflowJobStep[] = [];

  for (const candidate of value) {
    const step = asObject(candidate);
    const name = readOptionalString(step.name);
    const runValue = readOptionalString(step.run);
    const usesValue = readOptionalString(step.uses);

    if (runValue) {
      steps.push({
        kind: "run",
        name,
        value: runValue,
      });
    }

    if (usesValue) {
      steps.push({
        kind: "uses",
        name,
        value: usesValue,
      });
    }
  }

  return steps;
}

function normalizeStringList(value: unknown) {
  const items = Array.isArray(value) ? value : [value];

  return [
    ...new Set(
      items
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

function readScheduleCount(value: unknown) {
  if (Array.isArray(value)) {
    return value.length;
  }

  return value === undefined ? 0 : 1;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asObject(value: unknown) {
  return isPlainObject(value) ? value : {};
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
