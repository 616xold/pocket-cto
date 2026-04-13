import type { PersistCfoWikiPageLinkInput } from "../repository";
import type { WikiRegistryEntry } from "./page-registry";

export function buildWikiPageLinks(input: { registry: WikiRegistryEntry[] }) {
  const registryByKey = new Map(
    input.registry.map((entry) => [entry.pageKey, entry] as const),
  );
  const periodPages = input.registry.filter((entry) => entry.period !== null);
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

  return links;
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
