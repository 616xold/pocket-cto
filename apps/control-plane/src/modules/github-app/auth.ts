import { createPrivateKey, createSign, type KeyObject } from "node:crypto";
import type { GitHubAppConfig } from "./config";
import { GitHubAppAuthError } from "./errors";

export class GitHubAppAuth {
  private readonly privateKey: KeyObject;
  private readonly privateKeyPem: string;

  constructor(
    private readonly config: Pick<GitHubAppConfig, "appId" | "privateKeyBase64">,
  ) {
    this.privateKeyPem = decodeGitHubAppPrivateKey(config.privateKeyBase64);

    try {
      this.privateKey = createPrivateKey(this.privateKeyPem);
    } catch (error) {
      throw new GitHubAppAuthError(
        "GitHub App private key PEM is invalid",
        error instanceof Error ? error.message : null,
      );
    }
  }

  createAppAuthorizationHeader(now = new Date()) {
    return `Bearer ${this.createAppJwt(now)}`;
  }

  createAppJwt(now = new Date()) {
    const nowSeconds = Math.floor(now.getTime() / 1000);
    const header = toBase64Url(
      JSON.stringify({
        alg: "RS256",
        typ: "JWT",
      }),
    );
    const payload = toBase64Url(
      JSON.stringify({
        exp: nowSeconds + 9 * 60,
        iat: nowSeconds - 60,
        iss: this.config.appId,
      }),
    );
    const signingInput = `${header}.${payload}`;
    const signature = createSign("RSA-SHA256")
      .update(signingInput)
      .end()
      .sign(this.privateKey)
      .toString("base64url");

    return `${signingInput}.${signature}`;
  }

  getPrivateKeyPem() {
    return this.privateKeyPem;
  }
}

export function decodeGitHubAppPrivateKey(privateKeyBase64: string) {
  const privateKeyPem = Buffer.from(privateKeyBase64, "base64")
    .toString("utf8")
    .trim();

  if (
    !privateKeyPem.includes("BEGIN") ||
    !privateKeyPem.includes("PRIVATE KEY")
  ) {
    throw new GitHubAppAuthError(
      "GITHUB_APP_PRIVATE_KEY_BASE64 did not decode into a PEM private key",
    );
  }

  return privateKeyPem;
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}
