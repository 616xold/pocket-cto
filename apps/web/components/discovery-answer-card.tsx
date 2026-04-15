import React from "react";
import type {
  DiscoveryAnswerArtifactMetadata,
  DiscoveryMissionQuestion,
  FinanceDiscoveryQuestion,
  MissionDetailView,
  MissionRecord,
} from "@pocket-cto/domain";
import {
  isFinanceDiscoveryAnswerArtifactMetadata,
  isFinanceDiscoveryQuestion,
  readFinanceDiscoveryQuestionKindLabel,
} from "@pocket-cto/domain";
import { readFreshnessLabel } from "./freshness-label";
import { StatusPill } from "./status-pill";

type DiscoveryAnswerCardProps = {
  answer: MissionDetailView["discoveryAnswer"];
  mission: MissionDetailView["mission"];
};

export function DiscoveryAnswerCard({
  answer,
  mission,
}: DiscoveryAnswerCardProps) {
  const discoveryQuestion = mission.spec.input?.discoveryQuestion ?? null;

  if (
    isFinanceDiscoveryAnswer(answer) ||
    isFinanceDiscoveryQuestion(discoveryQuestion)
  ) {
    return (
      <FinanceDiscoveryAnswerCard
        answer={answer}
        discoveryQuestion={discoveryQuestion}
      />
    );
  }

  return (
    <LegacyDiscoveryAnswerCard
      answer={answer}
      discoveryQuestion={discoveryQuestion}
      mission={mission}
    />
  );
}

function FinanceDiscoveryAnswerCard(input: {
  answer: DiscoveryAnswerCardProps["answer"];
  discoveryQuestion: DiscoveryMissionQuestion | null;
}) {
  const answer = isFinanceDiscoveryAnswer(input.answer) ? input.answer : null;
  const question = isFinanceDiscoveryQuestion(input.discoveryQuestion)
    ? input.discoveryQuestion
    : null;
  const companyKey = answer?.companyKey ?? question?.companyKey ?? null;
  const questionKind = answer?.questionKind ?? question?.questionKind ?? null;
  const policySourceId =
    answer?.policySourceId ??
    (question?.questionKind === "policy_lookup"
      ? question.policySourceId
      : null);
  const questionKindLabel = questionKind
    ? readFinanceDiscoveryQuestionKindLabel(questionKind)
    : null;
  const relatedRoutes =
    answer?.relatedRoutes ??
    (question
      ? readFinanceFallbackRoutes(question)
      : []);

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="kicker">Discovery answer</p>
          <h2>Stored finance discovery</h2>
        </div>
        {answer ? (
          <StatusPill
            label={readFreshnessLabel(answer.freshnessPosture.state)}
            tone={readFreshnessTone(answer.freshnessPosture.state)}
          />
        ) : null}
      </div>

      <p className="muted">
        {answer
          ? answer.freshnessPosture.reasonSummary
          : "The mission exists, but no durable finance discovery answer artifact is stored yet. The scout task may still be running, or the mission may have failed before answer persistence."}
      </p>

      {answer ? (
        <p className="mission-summary-copy">{answer.answerSummary}</p>
      ) : null}

      <div className="meta-grid">
        <div>
          <dt>Company</dt>
          <dd>{companyKey ?? "Not recorded yet."}</dd>
        </div>
        <div>
          <dt>Question kind</dt>
          <dd>{questionKindLabel ?? "Not recorded yet."}</dd>
        </div>
        {questionKind === "policy_lookup" || policySourceId ? (
          <div>
            <dt>Policy source</dt>
            <dd>{policySourceId ?? "Not recorded yet."}</dd>
          </div>
        ) : null}
        <div>
          <dt>Freshness</dt>
          <dd>
            {answer
              ? readFreshnessLabel(answer.freshnessPosture.state)
              : readFreshnessLabel("pending_answer")}
          </dd>
        </div>
        <div>
          <dt>Limitations</dt>
          <dd>{answer?.limitations.length ?? 0}</dd>
        </div>
      </div>

      {question?.operatorPrompt ? (
        <div className="stack" style={{ marginTop: 18 }}>
          <h3>Operator prompt</h3>
          <p className="muted">{question.operatorPrompt}</p>
        </div>
      ) : null}

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related routes</h3>
        {relatedRoutes.length > 0 ? (
          <ul className="list-clean">
            {relatedRoutes.map((route) => (
              <li key={route.routePath}>
                {route.label} · <code>{route.routePath}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            No related routes were recorded for this mission.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related CFO Wiki pages</h3>
        {answer ? (
          answer.relatedWikiPages.length > 0 ? (
            <ul className="list-clean">
              {answer.relatedWikiPages.map((page) => (
                <li key={page.pageKey}>
                  <code>{page.pageKey}</code> · {page.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No related CFO Wiki pages were available.</p>
          )
        ) : (
          <p className="muted">
            Related CFO Wiki pages will appear after a discovery answer artifact
            is stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Evidence sections</h3>
        {answer ? (
          answer.evidenceSections.length > 0 ? (
            <ul className="list-clean">
              {answer.evidenceSections.map((section) => (
                <li key={section.key}>
                  <strong>{section.title}</strong> · {section.summary}
                  {section.routePath ? ` Route: ${section.routePath}.` : ""}
                  {section.pageKey ? ` Wiki page: ${section.pageKey}.` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No evidence sections were stored.</p>
          )
        ) : (
          <p className="muted">
            Evidence sections will appear after a discovery answer artifact is
            stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Limitations</h3>
        {answer ? (
          answer.limitations.length > 0 ? (
            <ul className="list-clean">
              {answer.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No explicit limitations were recorded.</p>
          )
        ) : (
          <p className="muted">
            Limitations will appear after a discovery answer artifact is stored.
          </p>
        )}
      </div>
    </section>
  );
}

function LegacyDiscoveryAnswerCard(input: {
  answer: DiscoveryAnswerCardProps["answer"];
  discoveryQuestion: DiscoveryMissionQuestion | null;
  mission: MissionRecord;
}) {
  const answer = isLegacyDiscoveryAnswer(input.answer) ? input.answer : null;
  const question =
    input.discoveryQuestion &&
    !isFinanceDiscoveryQuestion(input.discoveryQuestion)
      ? input.discoveryQuestion
      : null;
  const repoFullName =
    answer?.repoFullName ?? question?.repoFullName ?? input.mission.primaryRepo;
  const questionKind = answer?.questionKind ?? question?.questionKind;
  const changedPaths =
    answer?.changedPaths ??
    question?.changedPaths ??
    input.mission.spec.constraints.allowedPaths;

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="kicker">Discovery answer</p>
          <h2>Stored blast-radius evidence</h2>
        </div>
        {answer ? (
          <StatusPill
            label={readFreshnessLabel(answer.freshnessRollup.state)}
            tone={readFreshnessTone(answer.freshnessRollup.state)}
          />
        ) : null}
      </div>

      <p className="muted">
        {answer
          ? answer.freshnessRollup.reasonSummary
          : "The mission has been created, but no durable discovery answer artifact is stored yet. The scout task may still be running, or the mission may have failed before answer persistence."}
      </p>

      {answer ? (
        <p className="mission-summary-copy">{answer.answerSummary}</p>
      ) : null}

      <div className="meta-grid">
        <div>
          <dt>Repo</dt>
          <dd>{repoFullName ?? "Not recorded yet."}</dd>
        </div>
        <div>
          <dt>Question kind</dt>
          <dd>{questionKind ?? "Not recorded yet."}</dd>
        </div>
        <div>
          <dt>Freshness</dt>
          <dd>
            {answer
              ? readFreshnessLabel(answer.freshnessRollup.state)
              : readFreshnessLabel("pending_answer")}
          </dd>
        </div>
        <div>
          <dt>Limitations</dt>
          <dd>{answer?.limitations.length ?? 0}</dd>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Changed paths</h3>
        {changedPaths.length > 0 ? (
          <ul className="list-clean">
            {changedPaths.map((path) => (
              <li key={path}>
                <code>{path}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            No changed paths were recorded for this mission.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Impacted directories</h3>
        {answer ? (
          answer.impactedDirectories.length > 0 ? (
            <ul className="list-clean">
              {answer.impactedDirectories.map((directory) => (
                <li key={directory.path}>
                  <code>{directory.path}</code> ·{" "}
                  {formatOwnershipSummary(
                    directory.ownershipState,
                    directory.effectiveOwners,
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No impacted directories were stored.</p>
          )
        ) : (
          <p className="muted">
            Impacted directories will appear after a discovery answer artifact
            is stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Impacted manifests</h3>
        {answer ? (
          answer.impactedManifests.length > 0 ? (
            <ul className="list-clean">
              {answer.impactedManifests.map((manifest) => (
                <li key={manifest.path}>
                  <code>{manifest.path}</code> ·{" "}
                  {formatOwnershipSummary(
                    manifest.ownershipState,
                    manifest.effectiveOwners,
                  )}{" "}
                  · suites {manifest.relatedTestSuiteCount} · mapped CI jobs{" "}
                  {manifest.relatedMappedCiJobCount}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No impacted manifests were stored.</p>
          )
        ) : (
          <p className="muted">
            Impacted manifests will appear after a discovery answer artifact is
            stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related test suites</h3>
        {answer ? (
          answer.relatedTestSuites.length > 0 ? (
            <ul className="list-clean">
              {answer.relatedTestSuites.map((suite) => (
                <li key={suite.stableKey}>
                  <code>{suite.manifestPath}</code> ·{" "}
                  <code>{suite.scriptKey}</code> · matched jobs{" "}
                  {suite.matchedJobs.length}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No related test suites were stored.</p>
          )
        ) : (
          <p className="muted">
            Related test suites will appear after a discovery answer artifact is
            stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related mapped CI jobs</h3>
        {answer ? (
          answer.relatedMappedCiJobs.length > 0 ? (
            <ul className="list-clean">
              {answer.relatedMappedCiJobs.map((job) => (
                <li key={job.jobStableKey}>
                  {job.workflowName} · <code>{job.jobKey}</code> · manifests{" "}
                  {job.manifestPaths.length}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No related mapped CI jobs were stored.</p>
          )
        ) : (
          <p className="muted">
            Related mapped CI jobs will appear after a discovery answer artifact
            is stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Limitations</h3>
        {answer ? (
          answer.limitations.length > 0 ? (
            <ul className="list-clean">
              {answer.limitations.map((limitation) => (
                <li key={`${limitation.code}:${limitation.summary}`}>
                  <strong>{limitation.code}</strong> · {limitation.summary}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No explicit limitations were recorded.</p>
          )
        ) : (
          <p className="muted">
            Limitations will appear after a discovery answer artifact is stored.
          </p>
        )}
      </div>
    </section>
  );
}

function formatOwnershipSummary(
  ownershipState: "owned" | "unowned" | "unknown",
  effectiveOwners: string[],
) {
  if (ownershipState === "owned" && effectiveOwners.length > 0) {
    return `owners ${effectiveOwners.join(", ")}`;
  }

  if (ownershipState === "unowned") {
    return "no effective owners stored";
  }

  return "ownership unknown";
}

function readFreshnessTone(state: string) {
  return state === "fresh" ? ("good" as const) : ("warn" as const);
}

function isFinanceDiscoveryAnswer(
  answer: DiscoveryAnswerArtifactMetadata | null,
): answer is Extract<
  DiscoveryAnswerArtifactMetadata,
  { source: "stored_finance_twin_and_cfo_wiki" }
> {
  return isFinanceDiscoveryAnswerArtifactMetadata(answer);
}

function isLegacyDiscoveryAnswer(
  answer: DiscoveryAnswerArtifactMetadata | null,
): answer is Extract<
  DiscoveryAnswerArtifactMetadata,
  { source: "stored_twin_blast_radius_query" }
> {
  return answer?.source === "stored_twin_blast_radius_query";
}

function readFinanceFallbackRoutes(question: FinanceDiscoveryQuestion) {
  switch (question.questionKind) {
    case "cash_posture":
      return [
        {
          label: "Cash posture",
          routePath: `/finance-twin/companies/${question.companyKey}/cash-posture`,
        },
        {
          label: "Bank account inventory",
          routePath: `/finance-twin/companies/${question.companyKey}/bank-accounts`,
        },
      ];
    case "collections_pressure":
      return [
        {
          label: "Collections posture",
          routePath: `/finance-twin/companies/${question.companyKey}/collections-posture`,
        },
        {
          label: "Receivables aging",
          routePath: `/finance-twin/companies/${question.companyKey}/receivables-aging`,
        },
      ];
    case "payables_pressure":
      return [
        {
          label: "Payables posture",
          routePath: `/finance-twin/companies/${question.companyKey}/payables-posture`,
        },
        {
          label: "Payables aging",
          routePath: `/finance-twin/companies/${question.companyKey}/payables-aging`,
        },
      ];
    case "spend_posture":
      return [
        {
          label: "Spend posture",
          routePath: `/finance-twin/companies/${question.companyKey}/spend-posture`,
        },
        {
          label: "Spend items",
          routePath: `/finance-twin/companies/${question.companyKey}/spend-items`,
        },
      ];
    case "obligation_calendar_review":
      return [
        {
          label: "Obligation calendar",
          routePath: `/finance-twin/companies/${question.companyKey}/obligation-calendar`,
        },
        {
          label: "Contracts",
          routePath: `/finance-twin/companies/${question.companyKey}/contracts`,
        },
      ];
    case "policy_lookup":
      return [
        {
          label: "Scoped policy page",
          routePath: `/cfo-wiki/companies/${question.companyKey}/pages/${encodeURIComponent(`policies/${question.policySourceId}`)}`,
        },
        {
          label: "Company bound sources",
          routePath: `/cfo-wiki/companies/${question.companyKey}/sources`,
        },
      ];
  }
}
