export type McpWwwAuthenticateNoTokenLeakageMatch = {
  excerpt: string;
  lineNumber: number;
  pattern: string;
};

export type McpWwwAuthenticateNoTokenLeakageScan = {
  accepted: boolean;
  matches: readonly McpWwwAuthenticateNoTokenLeakageMatch[];
  rejectionReasons: readonly string[];
};

type LeakagePattern = {
  allowSafeAbsenceWording: boolean;
  name: string;
  pattern: RegExp;
};

const openAiApiKeyName = ["OPENAI", "API", "KEY"].join("_");

const leakagePatterns: readonly LeakagePattern[] = [
  {
    allowSafeAbsenceWording: true,
    name: "token-values-label",
    pattern: /\btoken values?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "cookies-label",
    pattern: /\bcookies?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "sessions-label",
    pattern: /\bsessions?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "credentials-label",
    pattern: /\bcredentials?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "client-secrets-label",
    pattern: /\bclient secrets?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "authorization-headers-label",
    pattern: /\bauthorization headers?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "prompt-text-label",
    pattern: /\bprompt text\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "proof-internals-label",
    pattern: /\bproof internals?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "openai-keys-label",
    pattern: /\bopenai keys?\b/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "authorization-bearer-header",
    pattern: /\bauthorization\s*:\s*bearer\s+[^\s,;]+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "bearer-token",
    pattern:
      /\bbearer\s+(?!resource_metadata\b|challenge\b|scheme\b)[A-Za-z0-9._~+/-]{8,}={0,2}\b/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "basic-token",
    pattern: /\bbasic\s+[A-Za-z0-9+/=]{8,}\b/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "openai-api-key-assignment",
    pattern: new RegExp(`\\b${openAiApiKeyName}\\s*=\\s*\\S+`, "iu"),
  },
  {
    allowSafeAbsenceWording: true,
    name: "openai-api-key-name",
    pattern: new RegExp(`\\b${openAiApiKeyName}\\b`, "iu"),
  },
  {
    allowSafeAbsenceWording: false,
    name: "openai-sk-key",
    pattern: /\bsk-[A-Za-z0-9][A-Za-z0-9_-]{8,}\b/u,
  },
  {
    allowSafeAbsenceWording: false,
    name: "api-key-parameter",
    pattern: /\bapi_key\s*=\s*[^&\s]+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "access-token-parameter",
    pattern: /\baccess_token\s*=\s*[^&\s]+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "refresh-token-parameter",
    pattern: /\brefresh_token\s*=\s*[^&\s]+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "client-secret-parameter",
    pattern: /\bclient_secret\s*=\s*[^&\s]+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "session-parameter",
    pattern: /\bsession\s*=\s*[^&\s]+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "cookie-header",
    pattern: /\bcookie\s*:\s*[^\s;]+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "x-api-key-header",
    pattern: /\bx-api-key\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "jwt-eyj-material",
    pattern:
      /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/u,
  },
  {
    allowSafeAbsenceWording: true,
    name: "company-key-authority",
    pattern: /\bcompanykey\s+(?:as\s+)?authority\b|\bcompanyKey\s*=/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "raw-finance-data",
    pattern: /\braw finance data\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "raw-source-dump",
    pattern: /\braw source dumps?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "provider-credential",
    pattern: /\bprovider credentials?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "app-submission-copy",
    pattern: /\bapp submission copy\b/iu,
  },
];

export function scanWwwAuthenticateNoTokenLeakage(
  text: string,
): McpWwwAuthenticateNoTokenLeakageScan {
  const matches = text.split("\n").flatMap((line, index) =>
    leakagePatterns.flatMap(({ allowSafeAbsenceWording, name, pattern }) => {
      if (allowSafeAbsenceWording && isSafeAbsenceOrProhibitionText(line)) {
        return [];
      }
      if (!pattern.test(line)) return [];
      return [
        {
          excerpt: line.trim().slice(0, 160),
          lineNumber: index + 1,
          pattern: name,
        },
      ];
    }),
  );

  return {
    accepted: matches.length === 0,
    matches,
    rejectionReasons: [...new Set(matches.map((match) => match.pattern))],
  };
}

export function textHasWwwAuthenticateNoTokenLeakage(text: string) {
  return scanWwwAuthenticateNoTokenLeakage(text).accepted;
}

function isSafeAbsenceOrProhibitionText(line: string) {
  return /\b(?:no|not|never|without|absent|absence|prohibit(?:ed|s)?|forbid(?:den)?|disallow(?:ed)?|reject(?:ed)?|blocked|must not|do not|does not|should not|cannot|can't)\b/iu.test(
    line,
  );
}
