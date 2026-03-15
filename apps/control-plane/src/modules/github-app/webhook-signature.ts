import { createHmac, timingSafeEqual } from "node:crypto";

const GITHUB_SIGNATURE_PREFIX = "sha256=";

export function createGitHubWebhookSignature(
  secret: string,
  rawBody: Buffer,
) {
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  return `${GITHUB_SIGNATURE_PREFIX}${digest}`;
}

export function verifyGitHubWebhookSignature(
  secret: string,
  rawBody: Buffer,
  signature: string,
) {
  if (!signature.startsWith(GITHUB_SIGNATURE_PREFIX)) {
    return false;
  }

  const expected = Buffer.from(createGitHubWebhookSignature(secret, rawBody));
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}
