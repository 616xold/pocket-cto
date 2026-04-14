import {
  buildCfoWikiPolicyPageKey,
} from "@pocket-cto/domain";
import type { PersistCfoWikiPageLinkInput } from "../repository";
import type { WikiRegistryEntry } from "./page-registry";

export function buildWikiPageLinks(input: { registry: WikiRegistryEntry[] }) {
  const registryByKey = new Map(
    input.registry.map((entry) => [entry.pageKey, entry] as const),
  );
  const periodPages = input.registry.filter((entry) => entry.period !== null);
  const sourceDigestPages = input.registry.filter(
    (entry) => entry.pageKind === "source_digest" && entry.documentSnapshot !== null,
  );
  const conceptPages = input.registry.filter(
    (entry) => entry.pageKind === "concept" && entry.conceptDefinition !== null,
  );
  const metricPages = input.registry.filter(
    (entry) =>
      entry.pageKind === "metric_definition" && entry.metricDefinition !== null,
  );
  const policyPages = input.registry.filter(
    (entry) => entry.pageKind === "policy" && entry.documentSource !== null,
  );
  const links: PersistCfoWikiPageLinkInput[] = [];

  addLink(links, registryByKey, "index", "company/overview", "navigation", "Company overview");
  addLink(links, registryByKey, "index", "sources/coverage", "navigation", "Source coverage");
  addLink(links, registryByKey, "index", "log", "navigation", "Compile log");

  for (const periodPage of periodPages) {
    addLink(
      links,
      registryByKey,
      "index",
      periodPage.pageKey,
      "navigation",
      periodPage.title,
    );
    addLink(
      links,
      registryByKey,
      periodPage.pageKey,
      "index",
      "navigation",
      "Wiki index",
    );
    addLink(
      links,
      registryByKey,
      periodPage.pageKey,
      "company/overview",
      "related",
      "Company overview",
    );
    addLink(
      links,
      registryByKey,
      periodPage.pageKey,
      "sources/coverage",
      "related",
      "Source coverage",
    );
  }

  addLink(links, registryByKey, "company/overview", "index", "navigation", "Wiki index");
  addLink(links, registryByKey, "company/overview", "sources/coverage", "related", "Source coverage");
  addLink(links, registryByKey, "company/overview", "log", "related", "Compile log");

  addLink(links, registryByKey, "sources/coverage", "index", "navigation", "Wiki index");
  addLink(links, registryByKey, "sources/coverage", "company/overview", "related", "Company overview");
  addLink(links, registryByKey, "sources/coverage", "log", "related", "Compile log");

  addLink(links, registryByKey, "log", "index", "navigation", "Wiki index");
  addLink(links, registryByKey, "log", "company/overview", "related", "Company overview");

  for (const conceptPage of conceptPages) {
    const conceptDefinition = conceptPage.conceptDefinition;

    if (!conceptDefinition) {
      continue;
    }

    addLink(links, registryByKey, "index", conceptPage.pageKey, "related", conceptPage.title);
    addLink(links, registryByKey, conceptPage.pageKey, "index", "navigation", "Wiki index");
    addLink(links, registryByKey, conceptPage.pageKey, "company/overview", "related", "Company overview");
    addLink(links, registryByKey, conceptPage.pageKey, "sources/coverage", "related", "Source coverage");

    for (const metricKey of conceptDefinition.relatedMetricKeys) {
      const metricPage = metricPages.find(
        (entry) => entry.metricDefinition?.metricKey === metricKey,
      );

      if (!metricPage) {
        continue;
      }

      addLink(
        links,
        registryByKey,
        conceptPage.pageKey,
        metricPage.pageKey,
        "related",
        metricPage.title,
      );
      addLink(
        links,
        registryByKey,
        metricPage.pageKey,
        conceptPage.pageKey,
        "related",
        conceptPage.title,
      );
    }

    if (conceptDefinition.includeAllPolicyPages) {
      for (const policyPage of policyPages) {
        addLink(
          links,
          registryByKey,
          conceptPage.pageKey,
          policyPage.pageKey,
          "related",
          policyPage.title,
        );
        addLink(
          links,
          registryByKey,
          policyPage.pageKey,
          conceptPage.pageKey,
          "related",
          conceptPage.title,
        );
      }
    }

    if (conceptDefinition.includePolicySourceDigests) {
      for (const sourceDigestPage of sourceDigestPages.filter(
        (entry) => entry.documentSource?.binding.documentRole === "policy_document",
      )) {
        addLink(
          links,
          registryByKey,
          conceptPage.pageKey,
          sourceDigestPage.pageKey,
          "related",
          sourceDigestPage.title,
        );
      }
    }
  }

  for (const metricPage of metricPages) {
    addLink(links, registryByKey, "index", metricPage.pageKey, "related", metricPage.title);
    addLink(links, registryByKey, metricPage.pageKey, "index", "navigation", "Wiki index");
    addLink(links, registryByKey, metricPage.pageKey, "company/overview", "related", "Company overview");
    addLink(links, registryByKey, metricPage.pageKey, "sources/coverage", "related", "Source coverage");

    for (const relatedPeriodPage of periodPages) {
      addLink(
        links,
        registryByKey,
        metricPage.pageKey,
        relatedPeriodPage.pageKey,
        "related",
        relatedPeriodPage.title,
      );
    }
  }

  for (const sourceDigestPage of sourceDigestPages) {
    addLink(
      links,
      registryByKey,
      "sources/coverage",
      sourceDigestPage.pageKey,
      "related",
      sourceDigestPage.title,
    );
    addLink(
      links,
      registryByKey,
      sourceDigestPage.pageKey,
      "index",
      "navigation",
      "Wiki index",
    );
    addLink(
      links,
      registryByKey,
      sourceDigestPage.pageKey,
      "sources/coverage",
      "navigation",
      "Source coverage",
    );
    addLink(
      links,
      registryByKey,
      sourceDigestPage.pageKey,
      "company/overview",
      "related",
      "Company overview",
    );

    if (sourceDigestPage.documentSource?.binding.documentRole === "policy_document") {
      addLink(
        links,
        registryByKey,
        sourceDigestPage.pageKey,
        buildCfoWikiPolicyPageKey(sourceDigestPage.documentSource.source.id),
        "related",
        "Current policy page",
      );
    }
  }

  for (const policyPage of policyPages) {
    addLink(links, registryByKey, "index", policyPage.pageKey, "related", policyPage.title);
    addLink(
      links,
      registryByKey,
      "sources/coverage",
      policyPage.pageKey,
      "related",
      policyPage.title,
    );
    addLink(links, registryByKey, policyPage.pageKey, "index", "navigation", "Wiki index");
    addLink(
      links,
      registryByKey,
      policyPage.pageKey,
      "sources/coverage",
      "navigation",
      "Source coverage",
    );
    addLink(
      links,
      registryByKey,
      policyPage.pageKey,
      "company/overview",
      "related",
      "Company overview",
    );

    for (const sourceDigestPage of sourceDigestPages.filter(
      (entry) => entry.documentSource?.source.id === policyPage.documentSource?.source.id,
    )) {
      addLink(
        links,
        registryByKey,
        policyPage.pageKey,
        sourceDigestPage.pageKey,
        "related",
        sourceDigestPage.title,
      );
    }
  }

  for (const sourceGroup of groupSourceDigestPages(sourceDigestPages)) {
    const currentPage = sourceGroup.find(
      (entry) => entry.documentSnapshot?.temporalStatus === "current",
    );

    for (const entry of sourceGroup) {
      if (entry.pageKey === currentPage?.pageKey) {
        continue;
      }

      addLink(
        links,
        registryByKey,
        entry.pageKey,
        currentPage?.pageKey ?? entry.pageKey,
        "related",
        currentPage?.documentSnapshot
          ? `Current snapshot v${currentPage.documentSnapshot.snapshot.version}`
          : "Current snapshot",
      );

      if (currentPage) {
        addLink(
          links,
          registryByKey,
          currentPage.pageKey,
          entry.pageKey,
          "related",
          `Superseded snapshot v${entry.documentSnapshot?.snapshot.version ?? "unknown"}`,
        );
      }
    }
  }

  return dedupeLinks(links);
}

function groupSourceDigestPages(sourceDigestPages: WikiRegistryEntry[]) {
  const groups = new Map<string, WikiRegistryEntry[]>();

  for (const page of sourceDigestPages) {
    const sourceId = page.documentSnapshot?.extract.sourceId;

    if (!sourceId) {
      continue;
    }

    const current = groups.get(sourceId);

    if (current) {
      current.push(page);
      continue;
    }

    groups.set(sourceId, [page]);
  }

  return [...groups.values()].map((group) =>
    group.sort(
      (left, right) =>
        (right.documentSnapshot?.snapshot.version ?? 0) -
        (left.documentSnapshot?.snapshot.version ?? 0),
    ),
  );
}

function addLink(
  links: PersistCfoWikiPageLinkInput[],
  registryByKey: Map<WikiRegistryEntry["pageKey"], WikiRegistryEntry>,
  fromPageKey: PersistCfoWikiPageLinkInput["fromPageKey"],
  toPageKey: PersistCfoWikiPageLinkInput["toPageKey"],
  linkKind: PersistCfoWikiPageLinkInput["linkKind"],
  label: string,
) {
  if (!registryByKey.has(fromPageKey) || !registryByKey.has(toPageKey)) {
    return;
  }

  links.push({
    fromPageKey,
    toPageKey,
    linkKind,
    label,
  });
}

function dedupeLinks(links: PersistCfoWikiPageLinkInput[]) {
  const unique = new Map<string, PersistCfoWikiPageLinkInput>();

  for (const link of links) {
    const key = [
      link.fromPageKey,
      link.toPageKey,
      link.linkKind,
      link.label,
    ].join("::");

    if (!unique.has(key)) {
      unique.set(key, link);
    }
  }

  return [...unique.values()];
}
