import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { EvidenceAtlasView } from "../../components/evidence-atlas/evidence-atlas-view";
import {
  buildEvidenceAtlasReadModel,
  type EvidenceAtlasReadModel,
} from "../../lib/evidence-atlas";
import { getControlPlaneHealth, getSourceList } from "../../lib/api";

type EvidenceAtlasPageProps = {
  searchParams?: Promise<{ companyKey?: string }>;
};

export default async function EvidenceAtlasPage(props: EvidenceAtlasPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const companyKey = normalizeCompanyKey(searchParams.companyKey);
  const [health, sourceList] = await Promise.all([
    getControlPlaneHealth(),
    getSourceList({ limit: 20 }),
  ]);
  const atlas: EvidenceAtlasReadModel = buildEvidenceAtlasReadModel({
    companyKey,
    sourceList,
  });

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Evidence Atlas</p>
        <h1>
          Read-only evidence inspection for local route context {companyKey}.
        </h1>
        <p className="lede">
          This V2D foundation visualizes source coverage, evidence chronology,
          document-map posture, evidence-card fields, answer anatomy boundaries,
          and forbidden action posture from existing contracts. It is not source
          truth, a second Finance Twin, a second CFO Wiki, generic RAG, LLM
          orchestration, report release, approval, provider work, source
          mutation, finance write, or autonomous remediation. The default
          <code>acme</code> key is a local route context only, not checked-in
          sample company data.
        </p>
        <div className="button-row" style={{ marginTop: 22 }}>
          <Link href={"/" as Route} className="button outline">
            Back to operator home
          </Link>
        </div>
      </section>

      <section className="card status-card">
        <div className="section-head">
          <div>
            <p className="kicker">Atlas boundary</p>
            <h2>Visualization only</h2>
          </div>
        </div>
        <dl className="meta-grid">
          <div>
            <dt>Control plane</dt>
            <dd>{health.ok ? "reachable" : "unreachable"}</dd>
          </div>
          <div>
            <dt>Company route context</dt>
            <dd>{companyKey} (local/default context only)</dd>
          </div>
          <div>
            <dt>Observed</dt>
            <dd>{health.now}</dd>
          </div>
          <div>
            <dt>Atlas generated</dt>
            <dd>{atlas.generatedAt}</dd>
          </div>
          <div>
            <dt>Live EvidenceIndex route</dt>
            <dd>not registered</dd>
          </div>
        </dl>
        <p className="muted" style={{ marginTop: 18 }}>
          Because FP-0084 prefers no backend expansion, this page does not add a
          control-plane route or web API route. Missing live EvidenceIndex and
          V2C artifacts are rendered as explicit limitations.
        </p>
      </section>

      <EvidenceAtlasView atlas={atlas} />
    </main>
  );
}

function normalizeCompanyKey(companyKey: string | undefined) {
  const normalized = companyKey?.trim();
  return normalized && normalized.length > 0 ? normalized : "acme";
}
