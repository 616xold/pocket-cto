import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { MonitoringAlertCard } from "../../components/monitoring-alert-card";
import { getLatestCashPostureMonitorResult } from "../../lib/api";

type MonitoringPageProps = {
  searchParams?: Promise<{ companyKey?: string }>;
};

export default async function MonitoringPage(props: MonitoringPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const companyKey = normalizeCompanyKey(searchParams.companyKey);
  const latest = await getLatestCashPostureMonitorResult(companyKey);
  const monitorResult = latest?.monitorResult ?? null;

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">F6A monitoring</p>
        <h1>Cash posture alert posture for {companyKey}.</h1>
        <p className="lede">
          Latest persisted cash_posture monitor result from stored Finance Twin
          cash-posture state.
        </p>
        <div className="button-row">
          <Link href={"/" as Route} className="button outline">
            Back to operator home
          </Link>
        </div>
      </section>

      {latest?.alertCard ? (
        <MonitoringAlertCard alertCard={latest.alertCard} />
      ) : (
        <section className="card status-card">
          <div className="section-head">
            <div>
              <p className="kicker">Cash posture monitor</p>
              <h2>{companyKey}</h2>
            </div>
          </div>
          <dl className="meta-grid">
            <div>
              <dt>Monitor kind</dt>
              <dd>cash_posture</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{monitorResult?.status ?? "not_run"}</dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>{monitorResult?.severity ?? "none"}</dd>
            </div>
            <div>
              <dt>Proof posture</dt>
              <dd>{monitorResult?.proofBundlePosture.state ?? "not_recorded"}</dd>
            </div>
          </dl>
          <p className="muted">
            {monitorResult?.deterministicSeverityRationale ??
              "No persisted F6A cash_posture monitor result is recorded for this company yet."}
          </p>
        </section>
      )}
    </main>
  );
}

function normalizeCompanyKey(companyKey: string | undefined) {
  const normalized = companyKey?.trim();
  return normalized && normalized.length > 0 ? normalized : "acme";
}
