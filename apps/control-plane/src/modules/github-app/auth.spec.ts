import { generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, it } from "vitest";
import { GitHubAppAuth, decodeGitHubAppPrivateKey } from "./auth";
import { GitHubAppAuthError } from "./errors";

describe("GitHubAppAuth", () => {
  it("decodes the base64 private key into PEM", () => {
    const privateKeyPem = createPrivateKeyPem();

    expect(
      decodeGitHubAppPrivateKey(Buffer.from(privateKeyPem).toString("base64")),
    ).toBe(privateKeyPem.trim());
  });

  it("creates a verifiable RS256 GitHub App JWT", () => {
    const { privateKeyPem, publicKey } = createKeyPair();
    const auth = new GitHubAppAuth({
      appId: "12345",
      privateKeyBase64: Buffer.from(privateKeyPem).toString("base64"),
    });
    const now = new Date("2026-03-15T10:00:00.000Z");
    const nowSeconds = Math.floor(now.getTime() / 1000);
    const jwt = auth.createAppJwt(now);
    const [encodedHeader, encodedPayload, encodedSignature] = jwt.split(".");

    expect(encodedHeader).toBeDefined();
    expect(encodedPayload).toBeDefined();
    expect(encodedSignature).toBeDefined();

    expect(decodeJwtSegment(encodedHeader ?? "")).toEqual({
      alg: "RS256",
      typ: "JWT",
    });
    expect(decodeJwtSegment(encodedPayload ?? "")).toEqual({
      exp: nowSeconds + 9 * 60,
      iat: nowSeconds - 60,
      iss: "12345",
    });
    expect(
      verify(
        "RSA-SHA256",
        Buffer.from(`${encodedHeader ?? ""}.${encodedPayload ?? ""}`),
        publicKey,
        Buffer.from(encodedSignature ?? "", "base64url"),
      ),
    ).toBe(true);
  });

  it("rejects a key that does not decode into a PEM private key", () => {
    expect(() => decodeGitHubAppPrivateKey(Buffer.from("not a pem").toString("base64"))).toThrow(
      GitHubAppAuthError,
    );
  });
});

function createPrivateKeyPem() {
  return createKeyPair().privateKeyPem;
}

function createKeyPair() {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  return {
    privateKeyPem: privateKey.export({
      format: "pem",
      type: "pkcs8",
    }) as string,
    publicKey,
  };
}

function decodeJwtSegment(segment: string) {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as {
    alg?: string;
    exp?: number;
    iat?: number;
    iss?: string;
    typ?: string;
  };
}
