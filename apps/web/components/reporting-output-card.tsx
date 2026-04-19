import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import {
  isFinanceDiscoveryQuestionKind,
  readFinanceDiscoveryQuestionKindLabel,
  readReportingMissionReportKindLabel,
} from "@pocket-cto/domain";
import { resolveControlPlaneUrl } from "../lib/api";
import { PolicySourceScopeFields } from "./policy-source-scope-fields";
import { ReadOnlyMarkdownPreview } from "./read-only-markdown-preview";
import { readFreshnessLabel } from "./freshness-label";
import { StatusPill } from "./status-pill";

type ReportingOutputCardProps = {
  proofBundle: MissionDetailView["proofBundle"];
  reporting: NonNullable<MissionDetailView["reporting"]>;
};

export function ReportingOutputCard({
  proofBundle,
  reporting,
}: ReportingOutputCardProps) {
  const boardPacket = reporting.boardPacket;
  const lenderUpdate = reporting.lenderUpdate;
  const financeMemo = reporting.financeMemo;
  const evidenceAppendix = reporting.evidenceAppendix;
  const publication = reporting.publication;
  const isBoardPacket = reporting.reportKind === "board_packet";
  const isLenderUpdate = reporting.reportKind === "lender_update";
  const isSpecializedReporting = isBoardPacket || isLenderUpdate;
  const questionKindLabel =
    reporting.questionKind && isFinanceDiscoveryQuestionKind(reporting.questionKind)
      ? readFinanceDiscoveryQuestionKindLabel(reporting.questionKind)
      : reporting.questionKind;

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="kicker">Reporting output</p>
          <h2>{readReportingMissionReportKindLabel(reporting.reportKind)}</h2>
        </div>
        <StatusPill label={reporting.draftStatus} />
      </div>

      <p className="muted">
        {reporting.freshnessSummary ??
          "The reporting mission exists, but no draft reporting artifact is stored yet."}
      </p>

      {publication?.summary ? (
        <p className="muted">{publication.summary}</p>
      ) : null}

      {reporting.reportSummary ? (
        <p className="mission-summary-copy">{reporting.reportSummary}</p>
      ) : null}

      <div className="meta-grid">
        <div>
          <dt>Report kind</dt>
          <dd>{readReportingMissionReportKindLabel(reporting.reportKind)}</dd>
        </div>
        <div>
          <dt>Draft posture</dt>
          <dd>{reporting.draftStatus}</dd>
        </div>
        <div>
          <dt>Source discovery mission</dt>
          <dd>
            <a href={`/missions/${reporting.sourceDiscoveryMissionId}`}>
              {reporting.sourceDiscoveryMissionId}
            </a>
          </dd>
        </div>
        {isSpecializedReporting ? (
          <div>
            <dt>Source reporting mission</dt>
            <dd>
              {reporting.sourceReportingMissionId ? (
                <a href={`/missions/${reporting.sourceReportingMissionId}`}>
                  {reporting.sourceReportingMissionId}
                </a>
              ) : (
                "Not recorded yet."
              )}
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Company</dt>
          <dd>{reporting.companyKey ?? "Not recorded yet."}</dd>
        </div>
        <div>
          <dt>Source question kind</dt>
          <dd>{questionKindLabel ?? "Not recorded yet."}</dd>
        </div>
        {reporting.questionKind === "policy_lookup" || reporting.policySourceId ? (
          <PolicySourceScopeFields
            fallbackPolicySourceId={reporting.policySourceId}
            scope={reporting.policySourceScope}
          />
        ) : null}
        <div>
          <dt>Freshness</dt>
          <dd>{readFreshnessLabel(proofBundle.freshnessState)}</dd>
        </div>
        <div>
          <dt>{isSpecializedReporting ? "Linked appendix" : "Appendix"}</dt>
          <dd>
            {reporting.appendixPresent
              ? isSpecializedReporting
                ? "Linked from source reporting mission"
                : "Stored"
              : "Pending"}
          </dd>
        </div>
        {isSpecializedReporting ? (
          <>
            <div>
              <dt>Source memo artifact</dt>
              <dd>
                <code>{readSpecializedSources(reporting)?.sourceFinanceMemo.artifactId ?? "Not recorded yet."}</code>
              </dd>
            </div>
            <div>
              <dt>Source appendix artifact</dt>
              <dd>
                <code>
                  {readSpecializedSources(reporting)?.sourceEvidenceAppendix.artifactId ??
                    "Not recorded yet."}
                </code>
              </dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Stored draft</dt>
              <dd>{publication?.storedDraft ? "Memo and appendix stored" : "Pending"}</dd>
            </div>
            <div>
              <dt>Memo page</dt>
              <dd>
                {publication?.filedMemo && reporting.companyKey ? (
                  <a
                    href={`${resolveControlPlaneUrl()}/cfo-wiki/companies/${encodeURIComponent(reporting.companyKey)}/pages/${encodeURIComponent(publication.filedMemo.pageKey)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <code>{publication.filedMemo.pageKey}</code>
                  </a>
                ) : (
                  "Not filed"
                )}
              </dd>
            </div>
            <div>
              <dt>Appendix page</dt>
              <dd>
                {publication?.filedEvidenceAppendix && reporting.companyKey ? (
                  <a
                    href={`${resolveControlPlaneUrl()}/cfo-wiki/companies/${encodeURIComponent(reporting.companyKey)}/pages/${encodeURIComponent(publication.filedEvidenceAppendix.pageKey)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <code>{publication.filedEvidenceAppendix.pageKey}</code>
                  </a>
                ) : (
                  "Not filed"
                )}
              </dd>
            </div>
            <div>
              <dt>Markdown export</dt>
              <dd>
                {publication?.latestMarkdownExport && reporting.companyKey ? (
                  <a
                    href={`${resolveControlPlaneUrl()}/cfo-wiki/companies/${encodeURIComponent(reporting.companyKey)}/exports/${encodeURIComponent(publication.latestMarkdownExport.exportRunId)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {publication.latestMarkdownExport.includesLatestFiledArtifacts
                      ? `Run ${publication.latestMarkdownExport.exportRunId}`
                      : `Run ${publication.latestMarkdownExport.exportRunId} (predates latest filing)`}
                  </a>
                ) : (
                  "No export run recorded"
                )}
              </dd>
            </div>
          </>
        )}
      </div>

      {boardPacket ? (
        <ReadOnlyMarkdownPreview
          bodyMarkdown={boardPacket.bodyMarkdown}
          title="Draft board packet body"
        />
      ) : null}

      {lenderUpdate ? (
        <ReadOnlyMarkdownPreview
          bodyMarkdown={lenderUpdate.bodyMarkdown}
          title="Draft lender update body"
        />
      ) : null}

      {financeMemo ? (
        <ReadOnlyMarkdownPreview
          bodyMarkdown={financeMemo.bodyMarkdown}
          title="Draft memo body"
        />
      ) : null}

      {evidenceAppendix ? (
        <ReadOnlyMarkdownPreview
          bodyMarkdown={evidenceAppendix.bodyMarkdown}
          title="Evidence appendix body"
        />
      ) : null}

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related routes</h3>
        {reporting.relatedRoutePaths.length > 0 ? (
          <ul className="list-clean">
            {reporting.relatedRoutePaths.map((routePath) => (
              <li key={routePath}>
                <code>{routePath}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No related routes were recorded yet.</p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related CFO Wiki pages</h3>
        {reporting.relatedWikiPageKeys.length > 0 ? (
          <ul className="list-clean">
            {reporting.relatedWikiPageKeys.map((pageKey) => (
              <li key={pageKey}>
                <code>{pageKey}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No related CFO Wiki pages were recorded yet.</p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Linked evidence</h3>
        {readLinkedArtifacts(reporting).length > 0 ? (
          <ul className="list-clean">
            {readLinkedArtifacts(reporting).map((artifact) => (
              <li key={artifact.artifactId}>
                {artifact.kind} · <code>{artifact.artifactId}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No source artifact linkage was recorded yet.</p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Limitations</h3>
        {evidenceAppendix?.limitations.length ? (
          <ul className="list-clean">
            {evidenceAppendix.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        ) : reporting.limitationsSummary ? (
          <p className="muted">{reporting.limitationsSummary}</p>
        ) : (
          <p className="muted">
            Limitations will appear after the draft reporting artifacts are
            stored.
          </p>
        )}
      </div>
    </section>
  );
}

function readLinkedArtifacts(reporting: ReportingOutputCardProps["reporting"]) {
  if (reporting.boardPacket) {
    return [
      reporting.boardPacket.sourceFinanceMemo,
      reporting.boardPacket.sourceEvidenceAppendix,
    ];
  }

  if (reporting.lenderUpdate) {
    return [
      reporting.lenderUpdate.sourceFinanceMemo,
      reporting.lenderUpdate.sourceEvidenceAppendix,
    ];
  }

  return reporting.evidenceAppendix?.sourceArtifacts ?? reporting.financeMemo?.sourceArtifacts ?? [];
}

function readSpecializedSources(reporting: ReportingOutputCardProps["reporting"]) {
  return reporting.boardPacket ?? reporting.lenderUpdate ?? null;
}
