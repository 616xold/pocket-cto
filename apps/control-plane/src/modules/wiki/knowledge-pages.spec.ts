import {
  buildCfoWikiConceptPageKey,
  buildCfoWikiMetricDefinitionPageKey,
  buildCfoWikiPolicyPageKey,
} from "@pocket-cto/domain";
import { describe, expect, it } from "vitest";
import { FinanceTwinService } from "../finance-twin/service";
import { InMemoryFinanceTwinRepository } from "../finance-twin/repository";
import { InMemorySourceRepository } from "../sources/repository";
import { SourceRegistryService } from "../sources/service";
import { InMemorySourceFileStorage } from "../sources/storage";
import { InMemoryCfoWikiRepository } from "./repository";
import { CfoWikiService } from "./service";

describe("F3D knowledge pages", () => {
  it("compiles deterministic concept and metric-definition pages with explicit missing policy coverage", async () => {
    const context = createKnowledgePageTestContext();

    await seedBankAccountSummarySlice(context, {
      companyKey: "acme",
      companyName: "Acme Holdings",
      createdBy: "finance-operator",
    });

    const compiled = await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "finance-operator",
    });
    const companySummary = await context.wikiService.getCompanySummary("acme");
    const cashConcept = await context.wikiService.getPage(
      "acme",
      buildCfoWikiConceptPageKey("cash"),
    );
    const cashMetric = await context.wikiService.getPage(
      "acme",
      buildCfoWikiMetricDefinitionPageKey("cash-posture"),
    );
    const policyCorpus = await context.wikiService.getPage(
      "acme",
      buildCfoWikiConceptPageKey("policy-corpus"),
    );

    expect(compiled.pageCountsByKind).toMatchObject({
      concept: 6,
      metric_definition: 7,
      policy: 0,
    });
    expect(compiled.compileRun.stats).toMatchObject({
      conceptPageCount: 6,
      metricDefinitionPageCount: 7,
      policyPageCount: 0,
    });
    expect(companySummary.pageCountsByKind).toMatchObject({
      concept: 6,
      metric_definition: 7,
      policy: 0,
    });
    expect(cashConcept).toMatchObject({
      page: {
        pageKey: "concepts/cash",
        pageKind: "concept",
      },
      freshnessSummary: {
        state: "fresh",
      },
    });
    expect(cashConcept.page.markdownBody).toContain("## Concept Scope");
    expect(cashConcept.page.markdownBody).toContain(
      "## Related Metric Definitions",
    );
    expect(
      cashConcept.links.some(
        (link) =>
          link.toPageKey === buildCfoWikiMetricDefinitionPageKey("cash-posture"),
      ),
    ).toBe(true);
    expect(
      cashConcept.refs.some(
        (ref) =>
          ref.targetKind === "finance_slice" &&
          ref.locator === "bank_account_summary_csv",
      ),
    ).toBe(true);
    expect(cashMetric).toMatchObject({
      page: {
        pageKey: "metrics/cash-posture",
        pageKind: "metric_definition",
      },
      freshnessSummary: {
        state: "fresh",
      },
    });
    expect(cashMetric.page.markdownBody).toContain(
      "Route-backed read: `/finance-twin/companies/:companyKey/cash-posture`",
    );
    expect(cashMetric.page.markdownBody).toContain("## Non-goals");
    expect(
      cashMetric.links.some((link) => link.toPageKey === "concepts/cash"),
    ).toBe(true);
    expect(
      cashMetric.refs.some(
        (ref) =>
          ref.targetKind === "finance_slice" &&
          ref.locator === "bank_account_summary_csv",
      ),
    ).toBe(true);
    expect(policyCorpus.freshnessSummary.state).toBe("missing");
    expect(policyCorpus.page.markdownBody).toContain("## Coverage Gaps");
    expect(policyCorpus.page.markdownBody).toContain(
      "No explicit `policy_document` sources are currently bound into compile for this company.",
    );
    expect(policyCorpus.limitations).toContain(
      "No explicit `policy_document` sources are currently bound into compile for this company.",
    );
  });

  it("compiles supported and unsupported policy pages as explicit current views or visible gaps", async () => {
    const context = createKnowledgePageTestContext();

    await context.financeRepository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const supportedPolicy = await seedMarkdownPolicySource(context, {
      companyKey: "acme",
      createdBy: "finance-operator",
      sourceName: "Travel and expense policy",
    });
    const unsupportedPolicy = await seedUnsupportedPolicySource(context, {
      companyKey: "acme",
      createdBy: "finance-operator",
      sourceName: "Security policy link",
    });

    await context.wikiService.bindCompanySource("acme", supportedPolicy.sourceId, {
      boundBy: "finance-operator",
      documentRole: "policy_document",
      includeInCompile: true,
    });
    await context.wikiService.bindCompanySource(
      "acme",
      unsupportedPolicy.sourceId,
      {
        boundBy: "finance-operator",
        documentRole: "policy_document",
        includeInCompile: true,
      },
    );

    const compiled = await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "finance-operator",
    });
    const supportedPage = await context.wikiService.getPage(
      "acme",
      buildCfoWikiPolicyPageKey(supportedPolicy.sourceId),
    );
    const unsupportedPage = await context.wikiService.getPage(
      "acme",
      buildCfoWikiPolicyPageKey(unsupportedPolicy.sourceId),
    );
    const policyCorpus = await context.wikiService.getPage(
      "acme",
      buildCfoWikiConceptPageKey("policy-corpus"),
    );

    expect(compiled.pageCountsByKind.policy).toBe(2);
    expect(supportedPage.freshnessSummary.state).toBe("fresh");
    expect(supportedPage.page.markdownBody).toContain("## Policy Source");
    expect(supportedPage.page.markdownBody).toContain(
      "Extraction support status: `extracted`",
    );
    expect(supportedPage.page.markdownBody).toContain("## Heading Outline");
    expect(
      supportedPage.links.some(
        (link) =>
          link.toPageKey === `sources/${supportedPolicy.sourceId}/snapshots/2`,
      ),
    ).toBe(true);
    expect(
      supportedPage.backlinks.some(
        (link) => link.fromPageKey === "concepts/policy-corpus",
      ),
    ).toBe(true);
    expect(
      supportedPage.refs.some((ref) => ref.refKind === "source_excerpt"),
    ).toBe(true);
    expect(unsupportedPage.freshnessSummary.state).toBe("missing");
    expect(unsupportedPage.page.markdownBody).toContain("## Policy Gap");
    expect(unsupportedPage.page.markdownBody).toContain(
      "Extraction support status: `unsupported`",
    );
    expect(
      unsupportedPage.limitations.some((limitation) =>
        limitation.includes("No stored raw source file"),
      ),
    ).toBe(true);
    expect(
      policyCorpus.links.some(
        (link) => link.toPageKey === buildCfoWikiPolicyPageKey(supportedPolicy.sourceId),
      ),
    ).toBe(true);
    expect(
      policyCorpus.links.some(
        (link) =>
          link.toPageKey === buildCfoWikiPolicyPageKey(unsupportedPolicy.sourceId),
      ),
    ).toBe(true);
  });

  it("surfaces failed policy extracts without inventing a digest", async () => {
    const context = createKnowledgePageTestContext();

    await context.financeRepository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const failedPolicy = await seedFailedPolicySource(context, {
      companyKey: "acme",
      createdBy: "finance-operator",
      sourceName: "Procurement policy",
    });

    await context.wikiService.bindCompanySource("acme", failedPolicy.sourceId, {
      boundBy: "finance-operator",
      documentRole: "policy_document",
      includeInCompile: true,
    });

    const compiled = await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "finance-operator",
    });
    const failedPage = await context.wikiService.getPage(
      "acme",
      buildCfoWikiPolicyPageKey(failedPolicy.sourceId),
    );

    expect(compiled.pageCountsByKind.policy).toBe(1);
    expect(failedPage.freshnessSummary.state).toBe("failed");
    expect(failedPage.page.pageKind).toBe("policy");
    expect(failedPage.page.markdownBody).toContain(
      "Extraction support status: `failed`",
    );
    expect(failedPage.page.markdownBody).toContain("## Policy Gap");
    expect(
      failedPage.limitations.some((limitation) =>
        limitation.includes("was not found"),
      ),
    ).toBe(true);
    expect(
      failedPage.refs.some((ref) => ref.targetKind === "source_file"),
    ).toBe(true);
  });
});

function createKnowledgePageTestContext() {
  let tick = 0;
  const baseTime = new Date("2026-04-13T12:00:00.000Z");
  const now = () => new Date(baseTime.getTime() + tick++ * 1000);
  const sourceRepository = new InMemorySourceRepository();
  const sourceStorage = new InMemorySourceFileStorage();
  const sourceService = new SourceRegistryService(
    sourceRepository,
    sourceStorage,
    now,
  );
  const financeRepository = new InMemoryFinanceTwinRepository();
  const financeTwinService = new FinanceTwinService({
    financeTwinRepository: financeRepository,
    sourceFileStorage: sourceStorage,
    sourceRepository,
    now,
  });
  const wikiRepository = new InMemoryCfoWikiRepository();
  const wikiService = new CfoWikiService({
    financeTwinRepository: financeRepository,
    sourceFileStorage: sourceStorage,
    sourceRepository,
    wikiRepository,
    now,
    compilerVersion: "test",
  });

  return {
    financeRepository,
    financeTwinService,
    now,
    sourceRepository,
    sourceService,
    wikiRepository,
    wikiService,
  };
}

async function seedBankAccountSummarySlice(
  context: ReturnType<typeof createKnowledgePageTestContext>,
  input: {
    companyKey: string;
    companyName: string;
    createdBy: string;
  },
) {
  const created = await context.sourceService.createSource({
    kind: "dataset",
    name: `${input.companyName} bank account summary`,
    createdBy: input.createdBy,
    originKind: "manual",
    snapshot: {
      originalFileName: `${input.companyKey}-bank-account-summary-link.txt`,
      mediaType: "text/plain",
      sizeBytes: 18,
      checksumSha256:
        "abababababababababababababababababababababababababababababababab",
      storageKind: "external_url",
      storageRef: `https://example.com/${input.companyKey}/bank-account-summary`,
      ingestStatus: "registered",
    },
  });
  const registered = await context.sourceService.registerSourceFile(
    created.source.id,
    {
      originalFileName: `${input.companyKey}-bank-account-summary.csv`,
      mediaType: "text/csv",
      createdBy: input.createdBy,
    },
    Buffer.from(
      [
        "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
        "Operating Checking,First National,1234,1200.00,1000.00,,USD,2026-04-10",
        "Treasury Sweep,First National,9012,,400.00,,USD,2026-04-11",
      ].join("\n"),
    ),
  );

  await context.financeTwinService.syncCompanySourceFile(
    input.companyKey,
    registered.sourceFile.id,
    {
      companyName: input.companyName,
    },
  );
}

async function seedMarkdownPolicySource(
  context: ReturnType<typeof createKnowledgePageTestContext>,
  input: {
    companyKey: string;
    createdBy: string;
    sourceName: string;
  },
) {
  const created = await context.sourceService.createSource({
    kind: "document",
    name: input.sourceName,
    createdBy: input.createdBy,
    originKind: "manual",
    snapshot: {
      originalFileName: `${input.companyKey}-policy-link.txt`,
      mediaType: "text/plain",
      sizeBytes: 20,
      checksumSha256:
        "cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd",
      storageKind: "external_url",
      storageRef: `https://example.com/${input.companyKey}/policy`,
      ingestStatus: "registered",
    },
  });

  await context.sourceService.registerSourceFile(
    created.source.id,
    {
      originalFileName: `${input.companyKey}-policy.md`,
      mediaType: "text/markdown",
      createdBy: input.createdBy,
    },
    Buffer.from(
      [
        "# Travel and Expense Policy",
        "",
        "Employees must submit card spend within five business days.",
        "",
        "## Approval Thresholds",
        "",
        "- CFO approval is required for spend above $5,000.",
      ].join("\n"),
    ),
  );

  return {
    sourceId: created.source.id,
  };
}

async function seedUnsupportedPolicySource(
  context: ReturnType<typeof createKnowledgePageTestContext>,
  input: {
    companyKey: string;
    createdBy: string;
    sourceName: string;
  },
) {
  const created = await context.sourceService.createSource({
    kind: "document",
    name: input.sourceName,
    createdBy: input.createdBy,
    originKind: "manual",
    snapshot: {
      originalFileName: `${input.companyKey}-policy-link.txt`,
      mediaType: "text/plain",
      sizeBytes: 20,
      checksumSha256:
        "edededededededededededededededededededededededededededededededed",
      storageKind: "external_url",
      storageRef: `https://example.com/${input.companyKey}/unsupported-policy`,
      ingestStatus: "registered",
    },
  });

  return {
    sourceId: created.source.id,
  };
}

async function seedFailedPolicySource(
  context: ReturnType<typeof createKnowledgePageTestContext>,
  input: {
    companyKey: string;
    createdBy: string;
    sourceName: string;
  },
) {
  const created = await context.sourceService.createSource({
    kind: "document",
    name: input.sourceName,
    createdBy: input.createdBy,
    originKind: "manual",
    snapshot: {
      originalFileName: `${input.companyKey}-policy-link.txt`,
      mediaType: "text/plain",
      sizeBytes: 20,
      checksumSha256:
        "f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0",
      storageKind: "external_url",
      storageRef: `https://example.com/${input.companyKey}/failed-policy`,
      ingestStatus: "registered",
    },
  });
  const snapshot = await context.sourceRepository.createSnapshot({
    sourceId: created.source.id,
    version: 2,
    originalFileName: `${input.companyKey}-failed-policy.md`,
    mediaType: "text/markdown",
    sizeBytes: 144,
    checksumSha256:
      "ababcdcdababcdcdababcdcdababcdcdababcdcdababcdcdababcdcdababcdcd",
    storageKind: "object_store",
    storageRef: `s3://missing-bucket/${input.companyKey}/failed-policy.md`,
    capturedAt: context.now().toISOString(),
    ingestStatus: "registered",
  });

  await context.sourceRepository.createSourceFile({
    sourceId: created.source.id,
    sourceSnapshotId: snapshot.id,
    originalFileName: `${input.companyKey}-failed-policy.md`,
    mediaType: "text/markdown",
    sizeBytes: 144,
    checksumSha256:
      "ababcdcdababcdcdababcdcdababcdcdababcdcdababcdcdababcdcdababcdcd",
    storageKind: "object_store",
    storageRef: `s3://missing-bucket/${input.companyKey}/failed-policy.md`,
    createdBy: input.createdBy,
    capturedAt: context.now().toISOString(),
  });

  return {
    sourceId: created.source.id,
  };
}
