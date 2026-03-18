import type { TwinOwnershipPatternShape } from "@pocket-cto/domain";
import type { OwnershipTarget } from "./ownership-targets";

export type MatchableOwnershipRule = {
  normalizedOwners: string[];
  ordinal: number;
  patternShape: TwinOwnershipPatternShape;
  rawPattern: string;
  sourceFilePath: string;
  stableKey: string;
};

export type EffectiveOwnershipMatch = {
  normalizedOwners: string[];
  ordinal: number;
  patternShape: TwinOwnershipPatternShape;
  rawPattern: string;
  ruleStableKey: string;
  sourceFilePath: string;
  targetEntityId: string;
  targetKind: OwnershipTarget["kind"];
  targetPath: string;
  targetStableKey: string;
};

type CompiledOwnershipRule = MatchableOwnershipRule & {
  matcher: RegExp;
};

export function matchOwnershipTargets(input: {
  rules: MatchableOwnershipRule[];
  targets: OwnershipTarget[];
}): EffectiveOwnershipMatch[] {
  const compiledRules = input.rules.map((rule) => ({
    ...rule,
    matcher: compileCodeownersPattern(rule.rawPattern),
  }));

  return input.targets
    .flatMap((target) => {
      let winningRule: CompiledOwnershipRule | null = null;

      for (const rule of compiledRules) {
        if (rule.matcher.test(normalizePath(target.path))) {
          winningRule = rule;
        }
      }

      if (!winningRule) {
        return [];
      }

      return [
        {
          normalizedOwners: winningRule.normalizedOwners,
          ordinal: winningRule.ordinal,
          patternShape: winningRule.patternShape,
          rawPattern: winningRule.rawPattern,
          ruleStableKey: winningRule.stableKey,
          sourceFilePath: winningRule.sourceFilePath,
          targetEntityId: target.entityId,
          targetKind: target.kind,
          targetPath: target.path,
          targetStableKey: target.stableKey,
        },
      ];
    })
    .sort((left, right) => {
      return (
        left.targetPath.localeCompare(right.targetPath) ||
        left.targetKind.localeCompare(right.targetKind) ||
        left.ordinal - right.ordinal
      );
    });
}

function compileCodeownersPattern(rawPattern: string) {
  const normalizedPattern = normalizePattern(rawPattern);
  const anchoredToRoot = normalizedPattern.startsWith("/");
  const trimmedPattern = stripLeadingSlash(normalizedPattern);
  const directoryOnly = trimmedPattern.endsWith("/");
  const patternBody = stripTrailingSlash(trimmedPattern);
  const containsSlash = patternBody.includes("/");
  const allowsDescendants = directoryOnly || !containsSlash;
  const expressionBody = globToRegex(patternBody);

  if (anchoredToRoot || containsSlash) {
    return new RegExp(
      `^${expressionBody}${allowsDescendants ? "(?:/.*)?$" : "$"}`,
    );
  }

  return new RegExp(
    `(?:^|.*/)${expressionBody}${allowsDescendants ? "(?:$|/.*)$" : "$"}`,
  );
}

function globToRegex(pattern: string) {
  let expression = "";

  for (let index = 0; index < pattern.length; ) {
    if (pattern.startsWith("**/", index)) {
      expression += "(?:.*/)?";
      index += 3;
      continue;
    }

    if (pattern.startsWith("**", index)) {
      expression += ".*";
      index += 2;
      continue;
    }

    const token = pattern[index];

    if (!token) {
      break;
    }

    if (token === "*") {
      expression += "[^/]*";
      index += 1;
      continue;
    }

    if (token === "?") {
      expression += "[^/]";
      index += 1;
      continue;
    }

    expression += escapeRegex(token);
    index += 1;
  }

  return expression;
}

function escapeRegex(token: string) {
  return token.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function normalizePattern(pattern: string) {
  return pattern.trim().replace(/\\/g, "/").replace(/\/+/g, "/");
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+/g, "/");
}

function stripLeadingSlash(pattern: string) {
  return pattern.startsWith("/") ? pattern.slice(1) : pattern;
}

function stripTrailingSlash(pattern: string) {
  return pattern.endsWith("/") ? pattern.slice(0, -1) : pattern;
}
