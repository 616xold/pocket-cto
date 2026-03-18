import { describe, expect, it } from "vitest";
import { matchOwnershipTargets } from "./ownership-matcher";

describe("matchOwnershipTargets", () => {
  it("uses last-match-wins semantics for directory and manifest targets", () => {
    const matches = matchOwnershipTargets({
      rules: [
        {
          stableKey: ".github/CODEOWNERS#0001",
          sourceFilePath: ".github/CODEOWNERS",
          ordinal: 1,
          rawPattern: "*",
          normalizedOwners: ["@platform"],
          patternShape: "ambiguous",
        },
        {
          stableKey: ".github/CODEOWNERS#0002",
          sourceFilePath: ".github/CODEOWNERS",
          ordinal: 2,
          rawPattern: "package.json",
          normalizedOwners: ["@manifests"],
          patternShape: "file_like",
        },
        {
          stableKey: ".github/CODEOWNERS#0003",
          sourceFilePath: ".github/CODEOWNERS",
          ordinal: 3,
          rawPattern: "apps/",
          normalizedOwners: ["@apps-team"],
          patternShape: "directory_like",
        },
        {
          stableKey: ".github/CODEOWNERS#0004",
          sourceFilePath: ".github/CODEOWNERS",
          ordinal: 4,
          rawPattern: "apps/web/package.json",
          normalizedOwners: ["@web-team"],
          patternShape: "file_like",
        },
      ],
      targets: [
        {
          entityId: "directory-apps",
          kind: "workspace_directory",
          stableKey: "apps",
          path: "apps",
          label: "Applications",
          classification: "application_group",
        },
        {
          entityId: "manifest-root",
          kind: "package_manifest",
          stableKey: "package.json",
          path: "package.json",
          packageName: "pocket-cto",
          private: true,
          hasWorkspaces: false,
          scriptNames: ["test"],
        },
        {
          entityId: "manifest-web",
          kind: "package_manifest",
          stableKey: "apps/web/package.json",
          path: "apps/web/package.json",
          packageName: "web-app",
          private: true,
          hasWorkspaces: false,
          scriptNames: ["dev"],
        },
      ],
    });

    expect(matches).toEqual([
      {
        targetEntityId: "directory-apps",
        targetKind: "workspace_directory",
        targetStableKey: "apps",
        targetPath: "apps",
        ruleStableKey: ".github/CODEOWNERS#0003",
        sourceFilePath: ".github/CODEOWNERS",
        ordinal: 3,
        rawPattern: "apps/",
        normalizedOwners: ["@apps-team"],
        patternShape: "directory_like",
      },
      {
        targetEntityId: "manifest-web",
        targetKind: "package_manifest",
        targetStableKey: "apps/web/package.json",
        targetPath: "apps/web/package.json",
        ruleStableKey: ".github/CODEOWNERS#0004",
        sourceFilePath: ".github/CODEOWNERS",
        ordinal: 4,
        rawPattern: "apps/web/package.json",
        normalizedOwners: ["@web-team"],
        patternShape: "file_like",
      },
      {
        targetEntityId: "manifest-root",
        targetKind: "package_manifest",
        targetStableKey: "package.json",
        targetPath: "package.json",
        ruleStableKey: ".github/CODEOWNERS#0002",
        sourceFilePath: ".github/CODEOWNERS",
        ordinal: 2,
        rawPattern: "package.json",
        normalizedOwners: ["@manifests"],
        patternShape: "file_like",
      },
    ]);
  });

  it("leaves unmatched targets without effective ownership", () => {
    const matches = matchOwnershipTargets({
      rules: [
        {
          stableKey: ".github/CODEOWNERS#0001",
          sourceFilePath: ".github/CODEOWNERS",
          ordinal: 1,
          rawPattern: "docs/",
          normalizedOwners: ["@docs-team"],
          patternShape: "directory_like",
        },
      ],
      targets: [
        {
          entityId: "directory-apps",
          kind: "workspace_directory",
          stableKey: "apps",
          path: "apps",
          label: "Applications",
          classification: "application_group",
        },
        {
          entityId: "manifest-root",
          kind: "package_manifest",
          stableKey: "package.json",
          path: "package.json",
          packageName: "pocket-cto",
          private: true,
          hasWorkspaces: false,
          scriptNames: ["test"],
        },
      ],
    });

    expect(matches).toEqual([]);
  });
});
