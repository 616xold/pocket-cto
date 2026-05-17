import {
  MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
  MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS,
} from "./read-only-app-mcp-www-authenticate-contracts";

export type McpWwwAuthenticateScopeChallengeValidation = {
  accepted: boolean;
  forbiddenMatches: readonly string[];
  readOnlyLeastPrivilege: boolean;
  rejectionReasons: readonly string[];
  rejectedScopes: readonly string[];
};

const scopeDelimiterPattern = /[:./_\-\s]+/u;

export function validateWwwAuthenticateScopeChallenge(
  scopes: readonly string[],
): McpWwwAuthenticateScopeChallengeValidation {
  const forbiddenMatches = scopes.filter(
    (scope) => forbiddenScopeTokensFor(scope).length > 0,
  );
  const rejectedScopes = scopes.filter(
    (scope) =>
      !MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES.includes(
        scope as (typeof MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES)[number],
      ),
  );
  const readOnlyLeastPrivilege = rejectedScopes.length === 0;
  const rejectionReasons = [
    forbiddenMatches.length === 0 ? "" : "forbidden_scope_token_detected",
    readOnlyLeastPrivilege ? "" : "scope_not_in_read_only_allowlist",
  ].filter(Boolean);

  return {
    accepted: forbiddenMatches.length === 0 && readOnlyLeastPrivilege,
    forbiddenMatches,
    readOnlyLeastPrivilege,
    rejectionReasons,
    rejectedScopes,
  };
}

function forbiddenScopeTokensFor(scope: string) {
  const normalized = scope.trim().toLowerCase();
  const segments = normalized
    .split(scopeDelimiterPattern)
    .filter(Boolean)
    .map(normalizeSearchToken);
  const compacted = normalizeSearchToken(normalized);

  return [
    ...new Set(
      MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS.filter((token) => {
        if (token === "*") return normalized.includes("*");
        const normalizedToken = normalizeSearchToken(token);
        return (
          segments.includes(normalizedToken) || compacted === normalizedToken
        );
      }),
    ),
  ];
}

function normalizeSearchToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}
